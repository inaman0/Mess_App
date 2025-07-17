import React, { useEffect, useState } from 'react';
import apiConfig from '../../config/apiConfig';
import MealMenuCard from '../components/MealMenuCard';
import { useNavigate } from 'react-router-dom';
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
  IsFeast: string;
}

const MEAL_TIME_RANGES = {
  Breakfast: { start: 6, end: 10 },    // 6 AM - 10 AM
  Lunch: { start: 10, end: 14.5 },     // 10 AM - 2:30 PM
  Snacks: { start: 14.5, end: 18 },    // 2:30 PM - 6 PM
  Dinner: { start: 18, end: 22 }       // 6 PM - 11 PM
};

const getCurrentMealType = (): string => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  
  for (const [mealType, range] of Object.entries(MEAL_TIME_RANGES)) {
    if (currentHour >= range.start && currentHour < range.end) {
      return mealType;
    }
  }
  
  return 'Breakfast';
};
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}
const MenuOfTime = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMealType, setCurrentMealType] = useState('');
  const [isCurrentMealFeast, setIsCurrentMealFeast] = useState(false);

  const apiUrl = `${apiConfig.getResourceUrl('menu_item')}?`;
  const apiMealUrl = `${apiConfig.getResourceUrl('meal')}?`;
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentMealType(getCurrentMealType());
    const interval = setInterval(() => {
      setCurrentMealType(getCurrentMealType());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

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

  // Filter meals to only include those for today
  const today = new Date();
  const todaysMeals = meals.filter(meal => meal.Date && isSameDate(meal.Date, today));

  // Filter menu items for current meal type and today's date
  const currentMealItems = menuItems.filter(item => {
    return todaysMeals.some(meal => 
      meal.id === item.Meal_id && 
      meal.Meal_type === currentMealType
    );
  });

  // Check if current meal is a feast
  useEffect(() => {
    const currentMeal = todaysMeals.find(meal => meal.Meal_type === currentMealType);
    setIsCurrentMealFeast(currentMeal?.IsFeast === "true");
  }, [currentMealType, todaysMeals]);

  if (menuItems.length === 0) return <div className="empty-message">No menu items available</div>;

  return (
    <div className={`menu-container ${isCurrentMealFeast ? 'feast-container' : ''}`}>
      <div className="header-container">
        <h1 className="current-meal-title">
          Today's {currentMealType} Menu ({today.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })})
          {isCurrentMealFeast && <span className="feast-label"> Feast Day!</span>}
        </h1>
        <button 
          onClick={() => navigate('/feedback')}
          className="feedback-button"
        >
          Give Feedback
        </button>
      </div>
      
      {currentMealItems.length > 0 ? (
        <div className="meal-cards-container">
          <div className="meal-type-row">
            {currentMealItems.map(item => {
              const meal = todaysMeals.find(meal => meal.id === item.Meal_id);
              const isItemFeast = meal?.IsFeast === "true";
              
              return (
                <div 
                  key={item.id} 
                  className={`meal-card ${isItemFeast ? 'feast-card' : ''}`}
                  data-meal-type={currentMealType}
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
              );
            })}
          </div>
        </div>
      ) : (
        <p className="no-items-message">
          No {currentMealType} items available for today
        </p>
      )}

      <div className="meal-times-info">
        <p className="info-title">Meal times:</p>
        <ul className="times-list">
          <li>Breakfast: 7:30 AM - 9:30 AM</li>
          <li>Lunch: 12:30 AM - 2:30 PM</li>
          <li>Snacks: 4:30 PM - 6 PM</li>
          <li>Dinner: 7:30 PM - 9:30 PM</li>
        </ul>
      </div>
    </div>
  );
};

export default MenuOfTime;