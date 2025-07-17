import React, { useEffect, useState } from "react";
import apiConfig from "../../config/apiConfig";
import MealMenuCard from "../components/MealMenuCard";
import "./WeeklyRatings.css";
import ReadReview from "../../components/Resource/ReadReview";
import { useQuery } from '@tanstack/react-query';

interface MenuItem {
  Dish_name: string;
  Meal_id: string;
  type: string;
  id: string;
}

interface MealData {
  id: string;
  Meal_type: string;
  Date: Date;
  IsFeast: string;
}

interface Rating {
  Menu_item_id: string;
  Ratings: number | string;
  [key: string]: any;
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const WeeklyRatings = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ratings, setRatings] = useState<Rating[]>([]);

  // const fetchMenuItems = async (): Promise<MenuItem[]> => {
  //   try {
  //     const accessToken = getCookie("access_token");
  //     if (!accessToken) {
  //       throw new Error("Access token not found");
  //     }

  //     const response = await fetch(apiConfig.getResourceUrl("menu_item"), {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${accessToken}`,
  //       },
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch menu items");
  //     }
  //     const data = await response.json();
  //     return data.resource || [];
  //   } catch (error) {
  //     console.error("Error fetching menu items:", error);
  //     throw error;
  //   }
  // };

  // const fetchMeals = async (): Promise<MealData[]> => {
  //   try {
  //     const accessToken = getCookie("access_token");
  //     if (!accessToken) {
  //       throw new Error("Access token not found");
  //     }

  //     const response = await fetch(apiConfig.getResourceUrl("meal"), {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${accessToken}`,
  //       },
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch meals");
  //     }
  //     const data = await response.json();
  //     return data.resource?.map((meal: any) => ({
  //       ...meal,
  //       Date: new Date(meal.Date),
  //     })) || [];
  //   } catch (error) {
  //     console.error("Error fetching meals:", error);
  //     throw error;
  //   }
  // };

  // // Using the new React Query v4+ syntax
  // const menuItemsQuery = useQuery<MenuItem[], Error>({
  //   queryKey: ['menuItems'],
  //   queryFn: fetchMenuItems,
  // });

  // const mealsQuery = useQuery<MealData[], Error>({
  //   queryKey: ['meals'],
  //   queryFn: fetchMeals,
  // });

  // // Handle side effects in useEffect
  // useEffect(() => {
  //   if (menuItemsQuery.data) {
  //     setMenuItems(menuItemsQuery.data);
  //   }
  //   if (menuItemsQuery.error) {
  //     setError("Failed to load menu items. Please try again later.");
  //   }
  // }, [menuItemsQuery.data, menuItemsQuery.error]);

  // useEffect(() => {
  //   if (mealsQuery.data) {
  //     setMeals(mealsQuery.data);
  //   }
  //   if (mealsQuery.error) {
  //     setError("Failed to load meals. Please try again later.");
  //   }
  // }, [mealsQuery.data, mealsQuery.error]);

  // useEffect(() => {
  //   setIsLoading(menuItemsQuery.isLoading || mealsQuery.isLoading);
  // }, [menuItemsQuery.isLoading, mealsQuery.isLoading]);

  const {data:Res,isLoading:isLoadingRes,error:errorRes}= useQuery({
    queryKey: ['resourceData', 'meal'],
     queryFn: async () => {
      const params = new URLSearchParams();
    
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

    const accessToken = getCookie("access_token");

    if (!accessToken) {
      throw new Error("Access token not found");
    }

      const response = await fetch(
        `${apiConfig.getResourceUrl('meal')}?` + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // Add token here
          },
          credentials: "include", // include cookies if needed
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();

      const parsedMeals = data.resource?.map((meal: any) => ({
        ...meal,
        Date: new Date(meal.Date)
      })) || [];
      // console.log(data)
      setMeals(parsedMeals);
      // return data;
    },
  })

  const {data:dataRes,isLoading:isLoadingDataRes,error:errorDataRes}= useQuery({
    queryKey: ['resourceData', 'menu_item'],
     queryFn: async () => {
      const params = new URLSearchParams();
    
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

    const accessToken = getCookie("access_token");

    if (!accessToken) {
      throw new Error("Access token not found");
    }

      const response = await fetch(
        `${apiConfig.getResourceUrl('menu_item')}?` + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`, // Add token here
          },
          credentials: "include", // include cookies if needed
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setMenuItems(data.resource || []);
      // return data;
    },
  })

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentDayMeals = meals.filter(
    (meal) => meal.Date && isSameDate(meal.Date, currentDate)
  );

  const mealTypeMap = currentDayMeals.reduce<Record<string, string>>(
    (acc, meal) => {
      acc[meal.id] = meal.Meal_type;
      return acc;
    },
    {}
  );

  const mealFeastMap = currentDayMeals.reduce<Record<string, string>>(
    (acc, meal) => {
      acc[meal.id] = meal.IsFeast;
      return acc;
    },
    {}
  );

  const currentDayMenuItems = menuItems.filter((item) =>
    currentDayMeals.some((meal) => meal.id === item.Meal_id)
  );

  const groupedMenu = currentDayMenuItems.reduce<Record<string, MenuItem[]>>(
    (acc, item) => {
      const mealType = mealTypeMap[item.Meal_id] || "Other";
      if (!acc[mealType]) acc[mealType] = [];
      acc[mealType].push(item);
      return acc;
    },
    {}
  );

  const mealTypeOrder = ["Breakfast", "Lunch", "Snacks", "Dinner", "Other"];

  return (
    <>
      <h1 className="wr-title">Ratings</h1>
      <div className="wr-uploader-wrapper">
        <div className="wr-read-review">
          <ReadReview setRatings={setRatings} />
        </div>
        <div className="wr-menu-container">
          <div className="wr-date-navigation">
            <button onClick={() => changeDate(-1)} className="wr-btn-primary">
              Previous Day
            </button>
            <h1 className="wr-date-title">
              Menu for {formatDate(currentDate)}
            </h1>
            <button onClick={() => changeDate(1)} className="wr-btn-primary">
              Next Day
            </button>
          </div>

          {currentDayMenuItems.length === 0 ? (
            <div className="wr-empty-message">
              No menu items available for this day
            </div>
          ) : (
            mealTypeOrder.map((mealType) => {
              const items = groupedMenu[mealType];
              if (!items || items.length === 0) return null;

              const mealId = items[0].Meal_id;
              const isFeast = mealFeastMap[mealId];
              const feastType = isFeast == "true" ? "Feast" : "Normal";

              return (
                <div key={mealType} className="wr-meal-type-section">
                  <h2 className="wr-meal-type-title">
                    {mealType}{" "}
                    {feastType === "Feast" && (
                      <span className="golden-badge">Feast</span>
                    )}
                  </h2>
                  <div className="wr-meal-type-row">
                    {items.map((item) => (
                      <MealMenuCard
                        key={item.id}
                        Dish_name={item.Dish_name}
                        type={item.type}
                        id={item.id}
                        mealType={mealType}
                        ratings={ratings}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default WeeklyRatings;