import React, { useState } from 'react';
import { useEffect } from 'react';
import apiConfig from '../../config/apiConfig';
import { useQuery } from '@tanstack/react-query';
import "./ReadSick_meal.css"; // Make sure to create this CSS file

export type ResourceMetaData = {
  resource: string;
  fieldValues: any[];
};

interface UserData {
  id: string;
  Name?: string;
  Email?: string;
  Room_no?: string;
  [key: string]: any;
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const ReadSick_meal = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [resMetaData, setResMetaData] = useState<ResourceMetaData[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [mealData, setMealData] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);

  const itemsPerPage = 5;
  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = `${apiConfig.getResourceUrl('sick_meal')}?`;
  const metadataUrl = `${apiConfig.getResourceMetaDataUrl('Sick_meal')}?`;
  const userApiUrl = `${apiConfig.getResourceUrl('user')}?`;
  const mealApiUrl = `${apiConfig.getResourceUrl('meal')}?`;

  // Field name mappings for display
  const fieldNameMapping: { [key: string]: string } = {
    User_id: "Student",
    user_id: "Student",
    Meal_id: "Meal",
    meal_id: "Meal",
    Instruction: "Instructions",
    instruction: "Instructions",
    instructions: "Instructions",
  };

  // Fetch sick meal data using React Query
  const { data: dataRes, isLoading: isLoadingDataRes, error: errorDataRes } = useQuery({
    queryKey: ['resourceData', 'sick_meal'],
    queryFn: async () => {
      const params = new URLSearchParams();
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        `${apiConfig.getResourceUrl('sick_meal')}?` + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setRowData(data.resource || []);
      return data;
    },
  });

  // Fetch metadata using React Query
  const { data: dataResMeta, isLoading: isLoadingDataResMeta, error: errorDataResMeta } = useQuery({
    queryKey: ['resourceMetaData', 'sick_meal'],
    queryFn: async () => {
      const response = await fetch(
        `${apiConfig.getResourceMetaDataUrl('sick_meal')}?`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setResMetaData(data);
      setFields(
        data[0]?.fieldValues?.filter(
          (field: any) => !regex.test(field.name) && field.name !== "id"
        ) || []
      );
      return data;
    },
  });

  // Fetch user data using React Query
  const { data: userDataRes } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const params = new URLSearchParams();
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        userApiUrl + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setUserData(data.resource || []);
      return data;
    },
  });

  // Fetch meal data using React Query
  const { data: mealDataRes } = useQuery({
    queryKey: ['mealData'],
    queryFn: async () => {
      const params = new URLSearchParams();
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        mealApiUrl + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setMealData(data.resource || []);
      return data;
    },
  });

  // Function to get user details by User_id
  const getUserDetails = (userId: string) => {
    const user = userData.find((u) => u.id === userId);
    if (user) {
      return {
        name: user.Name || "N/A",
        email: user.Email || "N/A",
        room: user.Room_no || "N/A",
      };
    }
    return { name: "N/A", email: "N/A", room: "N/A" };
  };

  // Function to get meal details by Meal_id
  const getMealDetails = (mealId: string) => {
    const meal = mealData.find((m) => m.id === mealId);
    if (meal) {
      return {
        mealType: meal.Meal_type || "N/A",
        date: meal.Date
          ? new Date(meal.Date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "N/A",
      };
    }
    return { mealType: "N/A", date: "N/A" };
  };

  // Pagination logic
  const totalPages = Math.ceil(rowData.length / itemsPerPage);
  const paginatedData = rowData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="sickmeal-container">
      <div className="sickmeal-header">
        <h2>Sick Meal Requests</h2>
      </div>

      {paginatedData.length === 0 ? (
        <div className="alert">No sick meal requests available.</div>
      ) : (
        <div className="sickmeal-grid">
          {paginatedData.map((meal, index) => (
            <div key={index} className="sickmeal-card">
              {fields.map((field) => {
                const displayName = fieldNameMapping[field.name] || field.name;

                return (
                  <div key={field.name} className="sickmeal-item">
                    <strong>{displayName}:</strong>{" "}
                    {field.name === "User_id" || field.name === "user_id" ? (
                      <div className="student-details">
                        <div>
                          <strong>Name:</strong> {getUserDetails(meal[field.name]).name}
                        </div>
                        <div>
                          <strong>Email:</strong> {getUserDetails(meal[field.name]).email}
                        </div>
                        <div>
                          <strong>Room:</strong> {getUserDetails(meal[field.name]).room}
                        </div>
                      </div>
                    ) : field.name === "Meal_id" || field.name === "meal_id" ? (
                      <div className="meal-details">
                        <div>
                          <strong>Meal Type:</strong> {getMealDetails(meal[field.name]).mealType}
                        </div>
                        <div>
                          <strong>Date:</strong> {getMealDetails(meal[field.name]).date}
                        </div>
                      </div>
                    ) : field.name.toLowerCase().includes("description") ||
                      field.name.toLowerCase().includes("reason") ||
                      field.name.toLowerCase().includes("instruction") ? (
                      <div className="sickmeal-text-scroll">
                        <span>{meal[field.name] || "N/A"}</span>
                      </div>
                    ) : (
                      <span>{meal[field.name] || "N/A"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span className="page-count">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="toast-container">
          <div className="toast show">
            <div className="toast-header">
              <strong className="me-auto">Success</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body">Operation completed successfully!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadSick_meal;