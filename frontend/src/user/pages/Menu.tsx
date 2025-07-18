import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiConfig from '../../config/apiConfig';
import ReviewMenuCard from '../components/ReviewMenuCard';
import './MenuStyles.css';

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

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = apiConfig.getResourceUrl('menu_item');
  const apiMealUrl = apiConfig.getResourceUrl('meal');

  // Fetch menu items using useQuery
  const { data: menuData, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const params = new URLSearchParams();
      params.append('queryId', 'GET_ALL');

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      return await response.json();
    },
  });

  // Fetch meals using useQuery
  const { data: mealData, isLoading: isMealLoading, error: mealError } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const params = new URLSearchParams();
      params.append('queryId', 'GET_ALL');

      const response = await fetch(`${apiMealUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }

      const data = await response.json();
      return {
        ...data,
        resource: data.resource?.map((meal: any) => ({
          ...meal,
          Date: new Date(meal.Date)
        })) || []
      };
    },
  });

  // Update state when queries complete
  useEffect(() => {
    if (menuData) {
      setMenuItems(menuData.resource || []);
    }
  }, [menuData]);

  useEffect(() => {
    if (mealData) {
      setMeals(mealData.resource || []);
    }
  }, [mealData]);

  // Combine loading states and errors
  useEffect(() => {
    setIsLoading(isMenuLoading || isMealLoading);
  }, [isMenuLoading, isMealLoading]);

  useEffect(() => {
    if (menuError || mealError) {
      setError(menuError?.message || mealError?.message || 'Failed to load menu. Please try again later.');
    }
  }, [menuError, mealError]);

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const today = new Date();
  const todaysMeals = meals.filter(meal => meal.Date && isSameDate(meal.Date, today));

  const mealTypeMap = todaysMeals.reduce<Record<string, string>>((acc, meal) => {
    acc[meal.id] = meal.Meal_type;
    return acc;
  }, {});

  const todaysMenuItems = menuItems.filter(item => 
    todaysMeals.some(meal => meal.id === item.Meal_id)
  );

  const groupedMenu = todaysMenuItems.reduce<Record<string, {items: MenuItem[], isFeast: boolean}>>((acc, item) => {
    const meal = todaysMeals.find(meal => meal.id === item.Meal_id);
    const mealType = meal?.Meal_type || 'Other';
    const isFeast = meal?.IsFeast === "true";
    
    if (!acc[mealType]) {
      acc[mealType] = {items: [], isFeast: false};
    }
    acc[mealType].items.push(item);
    
    if (isFeast) {
      acc[mealType].isFeast = true;
    }
    
    return acc;
  }, {});

  const mealTypeOrder = ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Other'];

  if (isLoading) return <div className="loading-message">Loading menu...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (todaysMenuItems.length === 0) return (
    <div className="empty-message">
      No menu items available for today ({today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })})
    </div>
  );

  return (
    <>

        <div className="menu-container">
      
        <div className="header-container">
          <h1 className="current-meal-title">
            Today's Menu ({today.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })})
          </h1>
        </div>
        
        {mealTypeOrder.map(mealType => {
          const group = groupedMenu[mealType];
          if (!group || group.items.length === 0) return null;
          
          return (
            <div key={mealType} className={`meal-type-section ${group.isFeast ? 'feast-section' : ''}`}>
              <div className="meal-type-header">
                <h2 className="meal-type-title">
                  {mealType}
                  {group.isFeast && <span className="feast-label">Feast Day!</span>}
                </h2>
              </div>
              <div className="meal-cards-container">
                <div className="meal-cards-row">
                  {group.items.map(item => (
                    <ReviewMenuCard
                      key={item.id}
                      Dish_name={item.Dish_name}
                      type={item.type}
                      id={item.id}
                      mealType={mealType}
                      isFeast={group.isFeast}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Menu;