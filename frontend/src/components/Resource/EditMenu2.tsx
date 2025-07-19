import React, { useState } from 'react';
import apiConfig from '../../config/apiConfig';
import './EditMenu2.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQuery } from '@tanstack/react-query';

type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

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
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const EditMenu2 = () => {
  const [date, setDate] = useState('');
  const [selectedType, setSelectedType] = useState<MealType | ''>('');
  const [filteredMeals, setFilteredMeals] = useState<MealData[]>([]);
  const [editedItems, setEditedItems] = useState<Record<string, Partial<MenuItem>>>({});
  const [newItems, setNewItems] = useState<Record<string, { Dish_name: string; type: string }>>({});
  const [editedFeastStatus, setEditedFeastStatus] = useState<Record<string, boolean>>({});

  const menuItemApiUrl = apiConfig.getResourceUrl('menu_item');
  const mealApiUrl = apiConfig.getResourceUrl('meal');

  // Fetch all meals
  const { data: meals = [], isLoading: isLoadingMeals, error: mealsError } = useQuery<MealData[]>({
    queryKey: ['meals'],
    queryFn: async () => {
      const accessToken = getCookie('access_token');
      if (!accessToken) throw new Error('Access token not found');

      const response = await fetch(`${mealApiUrl}?queryId=GET_ALL`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      return data.resource?.map((meal: any) => ({
        ...meal,
        Date: new Date(meal.Date),
      })) || [];
    },
  });

  // Fetch all menu items
  const { data: menuItems = [], isLoading: isLoadingMenuItems, error: menuItemsError } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const accessToken = getCookie('access_token');
      if (!accessToken) throw new Error('Access token not found');

      const response = await fetch(`${menuItemApiUrl}?queryId=GET_ALL`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json().then(data => data.resource || []);
    },
  });

  const handleInputChange = (id: string, field: string, value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleNewItemChange = (mealId: string, field: string, value: string) => {
    setNewItems(prev => ({
      ...prev,
      [mealId]: {
        ...(prev[mealId] || { Dish_name: '', type: '' }),
        [field]: value,
      },
    }));
  };

  const handleFeastToggle = (mealId: string, value: boolean) => {
    setEditedFeastStatus(prev => ({
      ...prev,
      [mealId]: value,
    }));
  };

  const handleSaveFeast = async (mealId: string) => {
    const meal = meals.find((m: MealData) => m.id === mealId);
    if (!meal) return;

    const updatedMeal = {
      ...meal,
      IsFeast: 'true',
    };

    const jsonString = JSON.stringify(updatedMeal);
    const base64Encoded = btoa(jsonString);
    const params = new URLSearchParams();
    params.append("action", "MODIFY");
    params.append("resource", base64Encoded);

    const accessToken = getCookie('access_token');
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      const response = await fetch(mealApiUrl+'?'+ params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
      
      if (response.ok) {
        console.log(response)
        toast.success('Meal updated successfully!');
        setEditedFeastStatus(prev => ({ ...prev, [mealId]: false }));
      } else {
        toast.error('Failed to update meal.');
      }
    } catch (err) {
      console.error('Error updating meal:', err);
      toast.error('Error occurred while updating meal.');
    }
  };

  const handleSaveItem = async (itemId: string) => {
    const fullItem = menuItems.find((item: MenuItem) => item.id === itemId);
    if (!fullItem) return;

    const updatedItem = {
      ...fullItem,
      ...editedItems[itemId],
    };

    const jsonString = JSON.stringify(updatedItem);
    const base64Encoded = btoa(jsonString);
    const params = new URLSearchParams();
    params.append("action", "MODIFY");
    params.append("resource", base64Encoded);

    const accessToken = getCookie('access_token');
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(menuItemApiUrl+'?'+params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log(response)
        toast.success('Item updated successfully!');
        setEditedItems(prev => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      } else {
        toast.error('Update failed.');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      toast.error('Error occurred while updating.');
    }
  };

  const handleCreateNewItem = async (mealId: string) => {
    const newItem = newItems[mealId];
    if (!newItem || !newItem.Dish_name || !newItem.type) return;

    const itemToCreate = {
      ...newItem,
      Meal_id: mealId,
    };

    const jsonString = JSON.stringify(itemToCreate);
    const base64Encoded = btoa(jsonString);
    const params = new URLSearchParams();
    params.append("resource", base64Encoded);

    const accessToken = getCookie('access_token');
    if (!accessToken) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(menuItemApiUrl+'?' + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log(response);
        toast.success('New item created successfully!');
        setNewItems(prev => ({ ...prev, [mealId]: { Dish_name: '', type: '' } }));
      } else {
        toast.error('Failed to create new item.');
      }
    } catch (err) {
      console.error('Error creating new item:', err);
      toast.error('Error occurred while creating item.');
    }
  };

  const handleSearch = () => {
    if (!date || !selectedType) {
      toast.warning('Please select a date and a meal type');
      return;
    }

    const results = meals.filter((meal: MealData) => {
      const mealDate = new Date(meal.Date).toLocaleDateString('en-CA');
      return mealDate === date && meal.Meal_type === selectedType;
    });

    setFilteredMeals(results);
  };

  const getFilteredMenuItems = (mealId: string): MenuItem[] => {
    return menuItems.filter((item: MenuItem) => item.Meal_id === mealId);
  };


  return (
    <div className="edit-menu2-container">
      <ToastContainer
        closeOnClick
        pauseOnHover
        draggable
        closeButton
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        toastClassName="custom-toast"
      />

      <h2>Enter Date and Meal Type</h2>

      <div className="edit-menu2-controls">
        <label>Date: </label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="edit-menu2-meal-types">
        {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as MealType[]).map(type => (
          <label key={type}>
            <input
              type="radio"
              name="mealType"
              value={type}
              checked={selectedType === type}
              onChange={() => setSelectedType(type)}
            />{' '}
            {type}
          </label>
        ))}
      </div>

      <button onClick={handleSearch} className="edit-menu2-container-search">
        Search
      </button>

      <hr />

      {filteredMeals.length > 0 ? (
        <div className="edit-menu2-results">
          <h3>Matching Meals</h3>
          <ul>
            {filteredMeals.map((meal: MealData, idx: number) => {
              const items = getFilteredMenuItems(meal.id);
              return (
                <li key={idx}>
                  {items.length > 0 ? (
                    <ul>
                      {items.map((item: MenuItem, i: number) => (
                        <li key={i}>
                          <div className="edit-menu2-dish-row">
                            <input
                              type="text"
                              value={editedItems[item.id]?.Dish_name ?? item.Dish_name}
                              onChange={e => handleInputChange(item.id, 'Dish_name', e.target.value)}
                            />
                            <input
                              type="text"
                              value={editedItems[item.id]?.type ?? item.type}
                              onChange={e => handleInputChange(item.id, 'type', e.target.value)}
                            />
                            <button
                              onClick={() => handleSaveItem(item.id)}
                              className="edit-menu2-edit-button"
                            >
                              Save
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No dishes found for this meal.</p>
                  )}

                  <div className="edit-menu2-dish-row">
                    <input
                      type="text"
                      placeholder="New Dish Name"
                      value={newItems[meal.id]?.Dish_name || ''}
                      onChange={e => handleNewItemChange(meal.id, 'Dish_name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="New Type"
                      value={newItems[meal.id]?.type || ''}
                      onChange={e => handleNewItemChange(meal.id, 'type', e.target.value)}
                    />
                    <button
                      onClick={() => handleCreateNewItem(meal.id)}
                      className="edit-menu2-edit-button"
                    >
                      Add
                    </button>
                  </div>

                  {meal.IsFeast !== 'true' && (
                    <div className="edit-menu2-dish-row">
                      <label>
                        Feast:
                        <input
                          type="checkbox"
                          checked={editedFeastStatus[meal.id] ?? false}
                          onChange={e => handleFeastToggle(meal.id, e.target.checked)}
                        />
                      </label>
                      <button
                        onClick={() => handleSaveFeast(meal.id)}
                        className="edit-menu2-edit-button"
                      >
                        Mark as Feast
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No matching meals found.</p>
      )}
    </div>
  );
};

export default EditMenu2;