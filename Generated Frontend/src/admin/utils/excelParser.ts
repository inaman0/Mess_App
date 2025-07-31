import * as XLSX from "xlsx";
import apiConfig from "../../config/apiConfig";

export interface Dish {
  dishName: string;
  dishType: "Veg" | "Non-Veg" | "Egg";
}

export interface MealPlan {
  Date: Date;
  day: string;
  breakfast: Dish[];
  lunch: Dish[];
  snacks: Dish[];
  dinner: Dish[];
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const excelDateToMongoDate = (serial: number): Date => {
  console.log("[excelDateToMongoDate] Raw Excel serial:", serial);
  const utcDays = Math.floor(serial - 25569);
  const utcMilliseconds = utcDays * 86400 * 1000;
  const date = new Date(utcMilliseconds);

  if (serial >= 60) {
    date.setUTCDate(date.getUTCDate() - 1);
  }

  if (date.getUTCFullYear() < 2000) {
    date.setUTCFullYear(2000 + (date.getUTCFullYear() % 100));
  }

  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = date.getTime() + istOffset;
  const istDate = new Date(istTime);

  console.log("[excelDateToMongoDate] Converted date:", istDate);
  return new Date(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate()
  );
};

export const transformMenuData = (data: {
  [key: string]: (number | string)[];
}): MealPlan[] => {
  console.log("[transformMenuData] Input raw data:", data);
  const result: MealPlan[] = [];

  for (const day in data) {
    const items = data[day];
    console.log(`Processing day: ${day}, Items:`, items);
    const dates: number[] = [];
    let i = 0;

    while (typeof items[i] === "number") {
      dates.push(items[i] as number);
      i++;
    }

    const mealSections: Record<string, Dish[]> = {
      BREAKFAST: [],
      LUNCH: [],
      SNACKS: [],
      DINNER: [],
    };

    let currentMeal = "";

    for (; i < items.length; i++) {
      const entry = items[i] as string;
      if (entry === "") continue;

      if (mealSections.hasOwnProperty(entry)) {
        currentMeal = entry;
        continue;
      }

      if (currentMeal && typeof entry === "string") {
        const trimmed = entry.trim();
        if (trimmed === "") continue;

        const dishType = entry.toLowerCase().includes("chicken")
          ? "Non-Veg"
          : entry.toLowerCase().includes("egg")
          ? "Egg"
          : "Veg";

        mealSections[currentMeal].push({ dishName: entry, dishType });
      }
    }

    console.log(`Constructed mealSections for ${day}:`, mealSections);

    for (const date of dates) {
      const finalDate = excelDateToMongoDate(date);
      result.push({
        Date: finalDate,
        day,
        breakfast: mealSections.BREAKFAST,
        lunch: mealSections.LUNCH,
        snacks: mealSections.SNACKS,
        dinner: mealSections.DINNER,
      });
    }
  }

  console.log("[transformMenuData] Final transformed result:", result);
  return result;
};

export const handleFileUpload = (file: File): Promise<MealPlan[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (!result) throw new Error("No file content");
        console.log("[handleFileUpload] File loaded");

        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        const filteredData = parsedData.filter(
          (row) =>
            Array.isArray(row) &&
            row.some((cell) => cell != null && cell !== "")
        );

        console.log("[handleFileUpload] Parsed sheet data:", filteredData);

        const [headers, ...rows] = filteredData;
        const transformedJson: { [key: string]: any[] } = {};

        headers.forEach((header: string, index: number) => {
          transformedJson[header] = rows.map((row) => row[index]);
        });

        console.log("[handleFileUpload] Transformed JSON:", transformedJson);
        resolve(transformMenuData(transformedJson));
      } catch (error) {
        console.error("[handleFileUpload] Error reading file:", error);
        reject(error);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const submitMealPlansToMongo = async (
  mealPlans: MealPlan[]
): Promise<"success" | "partial" | "error"> => {
  if (!mealPlans || mealPlans.length === 0) {
    console.error("No meal plans provided.");
    return "error";
  }

  const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  const uploadUrlMeal = apiConfig.getResourceUrl("meal");
  const uploadUrlMenuItem = apiConfig.getResourceUrl("menu_item");
  const accessToken = getCookie("access_token");

  if (!accessToken) {
    console.error("Access token not found");
    return "error";
  }

  const mealIdMap = new Map<string, string>();
  let totalDishes = 0;
  let successfulDishes = 0;

  for (const row of mealPlans) {
    const istDate = new Date(
      row.Date.getTime() + 5.5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
    );
    const dateStr = istDate.toISOString().split("T")[0];
    console.log(`[submitMealPlansToMongo] Processing Date: ${dateStr}`);

    for (const mealType of mealTypes) {
      const mealPayload = {
        Date: dateStr,
        Meal_type: mealType,
        IsFeast: "false",
      };

      const params = new URLSearchParams();
      params.append("resource", btoa(JSON.stringify(mealPayload)));
      console.log(
        `[Meal POST] Payload for ${mealType} on ${dateStr}:`,
        mealPayload
      );

      try {
        const res = await fetch(`${uploadUrlMeal}?${params.toString()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        const resText = await res.text();
        console.log(`[Meal POST] Response for ${mealType}:`, resText);

        if (!res.ok) {
          console.error(
            `Failed to create meal ${mealType} on ${dateStr}`,
            resText
          );
          continue;
        }

        const resJson = JSON.parse(resText);
        const mealId = resJson.resource[0].id; 
        if (mealId) {
          const key = `${dateStr}|${mealType}`;
          mealIdMap.set(key, mealId);
          console.log(`Meal ID stored: ${key} → ${mealId}`);
        } else {
          console.warn(`Missing meal ID in response for ${mealType}`);
        }
      } catch (error) {
        console.error(`Error creating meal ${mealType} on ${dateStr}`, error);
      }
    }
  }

  for (const row of mealPlans) {
    const istDate = new Date(
      row.Date.getTime() + 5.5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
    );
    const dateStr = istDate.toISOString().split("T")[0];

    for (const mealType of mealTypes) {
      const key = `${dateStr}|${mealType}`;
      const mealId = mealIdMap.get(key);

      if (!mealId) {
        console.warn(`Missing mealId for ${key}, skipping...`);
        continue;
      }

      const dishes = row[mealType.toLowerCase() as keyof MealPlan] as Dish[];

      for (const dish of dishes) {
        totalDishes++;

        const menuItemPayload = {
          Dish_name: dish.dishName,
          type: dish.dishType,
          Meal_id: mealId,
        };

        const params = new URLSearchParams();
        params.append("resource", btoa(JSON.stringify(menuItemPayload)));
        console.log(`[Menu Item POST] Payload:`, menuItemPayload);

        try {
          const res = await fetch(`${uploadUrlMenuItem}?${params.toString()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

          const resText = await res.text();
          console.log(`[Menu Item POST] Response:`, resText);

          if (res.ok) {
            successfulDishes++;
          } else {
            console.error(
              `Failed to post dish "${dish.dishName}" for ${mealType} on ${dateStr}`,
              resText
            );
          }
        } catch (error) {
          console.error(`Error posting dish:`, error);
        }
      }
    }
  }

  console.log(
    `[submitMealPlansToMongo] Posting summary: ${successfulDishes}/${totalDishes} dishes successful.`
  );

  if (successfulDishes === totalDishes && totalDishes > 0) return "success";
  if (successfulDishes > 0) return "partial";
  return "error";
};
