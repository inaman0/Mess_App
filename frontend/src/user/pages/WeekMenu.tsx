import React, { useEffect, useState } from 'react';
import apiConfig from '../../config/apiConfig';
import '../components/Custom.css';
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
}
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}
const WeekMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const apiUrl = apiConfig.getResourceUrl('menu_item');
  const apiMealUrl = apiConfig.getResourceUrl('meal');

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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Filter meals for the current date
  const currentDayMeals = meals.filter(meal => meal.Date && isSameDate(meal.Date, currentDate));

  // Create map of meal_id to meal_type
  const mealTypeMap = currentDayMeals.reduce<Record<string, string>>((acc, meal) => {
    acc[meal.id] = meal.Meal_type;
    return acc;
  }, {});

  // Filter menu items to only include those with meal IDs from current day's meals
  const currentDayMenuItems = menuItems.filter(item => 
    currentDayMeals.some(meal => meal.id === item.Meal_id)
  );

  // Group menu items by meal type
  const groupedMenu = currentDayMenuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const mealType = mealTypeMap[item.Meal_id] || 'Other';
    if (!acc[mealType]) acc[mealType] = [];
    acc[mealType].push(item);
    return acc;
  }, {});

  // Define the order of meal types for consistent display
  const mealTypeOrder = ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Other'];

  return (
    <div className="menu-container">
      <div className="date-navigation">
        <button 
          onClick={() => changeDate(-1)}
          className="btn-primary"
        >
          Previous Day
        </button>
        <h1 className="date-title">
          Menu for {formatDate(currentDate)}
        </h1>
        <button 
          onClick={() => changeDate(1)}
          className="btn-primary"
        >
          Next Day
        </button>
      </div>

      {currentDayMenuItems.length === 0 ? (
        <div className="empty-message">
          No menu items available for this day
        </div>
      ) : (
        mealTypeOrder.map(mealType => {
          const items = groupedMenu[mealType];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={mealType} className="meal-type-section">
              <h2 className="meal-type-title">{mealType}</h2>
              <div className="meal-type-row">
                {items.map(item => (
                  <div 
                    key={item.id}
                    className={`meal-card`}
                    data-meal-type={mealType}
                  >
                    <div className="meal-card-content">
                      <div className="dish-name-container">
                        <h3 className="dish-name">{item.Dish_name}</h3>
                        <p className={`dish-type ${item.type === 'Veg' ? 'dish-type-veg' : 'dish-type-nonveg'}`}>
                          {item.type === 'Veg' ? 'VEG' : 'NON-VEG'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default WeekMenu;