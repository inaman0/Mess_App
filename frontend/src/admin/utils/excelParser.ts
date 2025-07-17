import * as XLSX from 'xlsx';

export interface Dish {
  dishName: string;
  dishType: 'Veg' | 'Non-Veg' | 'Egg';
}

export interface MealPlan {
  Date: Date;
  day: string;
  breakfast: Dish[];
  lunch: Dish[];
  snacks: Dish[];
  dinner: Dish[];
}

export const excelDateToMongoDate = (serial: number): Date => {
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
  
  return new Date(
    istDate.getUTCFullYear(),
    istDate.getUTCMonth(),
    istDate.getUTCDate()
  );
};

const base64EncodeUnicode = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const transformMenuData = (data: { [key: string]: (number | string)[] }): MealPlan[] => {
  const result: MealPlan[] = [];
  
  for (const day in data) {
    const items = data[day];
    const dates: number[] = [];
    let i = 0;
    
    while (typeof items[i] === 'number') {
      dates.push(items[i] as number);
      i++;
    }

    const mealSections = {
      BREAKFAST: [],
      LUNCH: [],
      SNACKS: [],
      DINNER: [],
    } as Record<string, Dish[]>;

    let currentMeal = '';
    
    for (; i < items.length; i++) {
      const entry = items[i] as string;
      if (entry === '') continue;
      
      if (mealSections.hasOwnProperty(entry)) {
        currentMeal = entry;
        continue;
      }
      
      if (currentMeal && typeof entry === 'string') {
        const trimmed = entry.trim();
        if (trimmed === '') continue;
        
        const dishType =
          entry.toLowerCase().includes('chicken') ? 'Non-Veg' :
          entry.toLowerCase().includes('egg') ? 'Egg' : 'Veg';
        
        mealSections[currentMeal].push({ dishName: entry, dishType });
      }
    }

    for (const date of dates) {
      result.push({
        Date: excelDateToMongoDate(date),
        day,
        breakfast: mealSections.BREAKFAST,
        lunch: mealSections.LUNCH,
        snacks: mealSections.SNACKS,
        dinner: mealSections.DINNER,
      });
    }
  }
  
  return result;
};

export const handleFileUpload = (file: File): Promise<MealPlan[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (!result) throw new Error('No file content');
        
        const data = new Uint8Array(result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const filteredData = parsedData.filter(row => 
          Array.isArray(row) && row.some(cell => cell != null && cell !== '')
        );
        
        const [headers, ...rows] = filteredData;
        const transformedJson: { [key: string]: any[] } = {};
        
        headers.forEach((header: string, index: number) => {
          transformedJson[header] = rows.map(row => row[index]);
        });
        
        resolve(transformMenuData(transformedJson));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const submitMealPlansToMongo = async (
  mealPlans: MealPlan[],
  uploadUrlMeal: string,
  uploadUrlMenuItem: string,
  readMealUrl: string,
  accessToken: string
): Promise<'success' | 'partial' | 'error'> => {
  if (!mealPlans || mealPlans.length === 0) return 'error';

  const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  let totalDishes = 0;
  let successfulDishes = 0;

  // Add all Meals
  for (const row of mealPlans) {
    const istDate = new Date(row.Date.getTime() + (5.5 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000));
    const dateStr = istDate.toISOString().split('T')[0];
    
    for (const mealType of mealTypes) {
      const mealPayload = {
        Date: dateStr,
        Meal_type: mealType,
        IsFeast: ""
      };

      const formData = new URLSearchParams();
      formData.append('resource', base64EncodeUnicode(JSON.stringify(mealPayload)));
      formData.append('resource_name', 'Meal');
      formData.append('action', 'add');

      try {
        const mealResponse = await fetch(uploadUrlMeal, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData.toString()
        });

        if (!mealResponse.ok) {
          console.error(`Failed to POST meal for ${mealType} on ${dateStr}`);
        }
      } catch (error) {
        console.error(`Error posting meal: ${error}`);
      }
    }
  }

  // Fetch all meals to build mealIdMap
  const mealIdMap = new Map<string, string>();
  
  try {
    const readResponse = await fetch(readMealUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!readResponse.ok) {
      console.error('Failed to fetch all meals after insert');
      return 'error';
    }

    const readData = await readResponse.json();
    const meals = readData.resource;

    for (const meal of meals) {
      const mealDate = new Date(meal.Date).toISOString().split('T')[0];
      const mealType = meal.Meal_type;
      const mealId = meal._id || meal.id || meal.resource_id;

      if (mealDate && mealType && mealId) {
        mealIdMap.set(`${mealDate}|${mealType}`, mealId);
      }
    }
  } catch (error) {
    console.error(`Error fetching meals: ${error}`);
    return 'error';
  }

  // Add all Dishes (Menu_item)
  for (const row of mealPlans) {
    const istDate = new Date(row.Date.getTime() + (5.5 * 60 * 60 * 1000));
    const dateStr = istDate.toISOString().split('T')[0];

    for (const mealType of mealTypes) {
      const key = `${dateStr}|${mealType}`;
      const mealId = mealIdMap.get(key);

      if (!mealId) {
        console.error(`Missing meal ID for ${mealType} on ${dateStr}`);
        continue;
      }

      const dishes = row[mealType.toLowerCase() as keyof MealPlan] as Dish[];

      if (!dishes || !Array.isArray(dishes)) {
        console.warn(`No dishes found for ${mealType} on ${dateStr}`);
        continue;
      }

      for (const dish of dishes) {
        totalDishes++;

        const menuItemPayload = {
          Dish_name: dish.dishName,
          type: dish.dishType,
          Meal_id: mealId
        };

        const dishFormData = new URLSearchParams();
        dishFormData.append('resource', base64EncodeUnicode(JSON.stringify(menuItemPayload)));
        dishFormData.append('resource_name', 'Menu_item');
        dishFormData.append('action', 'add');

        try {
          const dishResponse = await fetch(uploadUrlMenuItem, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Bearer ${accessToken}`
            },
            body: dishFormData.toString()
          });

          if (dishResponse.ok) {
            successfulDishes++;
          } else {
            const errorText = await dishResponse.text();
            console.error(`Failed to POST dish "${dish.dishName}":`, errorText);
          }
        } catch (error) {
          console.error(`Error posting dish: ${error}`);
        }
      }
    }
  }

  return successfulDishes === totalDishes && totalDishes > 0 
    ? 'success' 
    : successfulDishes > 0 
      ? 'partial' 
      : 'error';
};