import React, { useState, useEffect, useRef } from "react";
import apiConfig from "../../config/apiConfig";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchForeignResource } from "../../apis/resources";
import { fetchEnum } from "../../apis/enum";
import { jwtDecode } from "jwt-decode";

export type resourceMetaData = {
  resource: string;
  fieldValues: any[];
};

interface Meal {
  id: string;
  Date: string;
  Meal_type: string;
}

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

const CreateSick_meal = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [dataToSave, setDataToSave] = useState<any>({});
  const [showToast, setShowToast] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [foreignkeyData, setForeignkeyData] = useState<Record<string, any[]>>(
    {}
  );
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );
  const [enums, setEnums] = useState<Record<string, any[]>>({});
  const [mealData, setMealData] = useState<Meal[]>([]);
  const [mealTypes, setMealTypes] = useState<string[]>([
    "Breakfast",
    "Lunch",
    "Snacks",
    "Dinner",
  ]);
  const [mealSelection, setMealSelection] = useState({
    Date: "",
    Meal_type: "",
  });

  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = apiConfig.getResourceUrl("sick_meal");
  const userApiUrl = `${apiConfig.getResourceUrl("user")}?`;
  const apimealUrl = apiConfig.getResourceUrl("meal");
  const metadataUrl = apiConfig.getResourceMetaDataUrl("Sick_meal");
  const navigate = useNavigate();

  const HARDCODED_USER_ID = "07a600cf-f4e0-461a-a7ea-17ec4185d159-56";
  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const accessToken = getCookie("access_token");
  const decodedJwt: any = jwtDecode(accessToken || "");

  // Set hardcoded user ID when component mounts
  useEffect(() => {
    const userId = userData.map((user: UserData) => {
      if (user.Email === decodedJwt.email) {
        return user.id;
      }
    })

    setDataToSave({ User_id: userId });
  }, []);

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
        console.log("User Data:", data.resource);
        return data;
      },
    });

  // Fetch all meals data with access token
  const {
    data: dataRes,
    isLoading: isLoadingDataRes,
    error: errorDataRes,
  } = useQuery({
    queryKey: ["resourceData", "meal"],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        const queryId: any = "GET_ALL";
        params.append("queryId", queryId);

        const accessToken = getCookie("access_token");

        if (!accessToken) {
          throw new Error("Access token not found");
        }

        const response = await fetch(
          `${apiConfig.getResourceUrl("meal")}?` + params.toString(),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Add token here
            },
            credentials: "include", // include cookies if needed
          }
        );

        if (response.ok) {
          const data = (await response.json()) as { resource: Meal[] };
          // console.log(data)
          setMealData(data.resource);

          // Extract unique meal types
          if (data.resource?.length > 0) {
            const types = [
              ...new Set(data.resource.map((meal) => meal.Meal_type)),
            ];
            setMealTypes(types);
          }
        }
      } catch (error) {
        console.error("Error fetching meal data:", error);
      }
    },
  });

  // Fetch foreign data function
  const fetchForeignData = async (
    foreignResource: string,
    fieldName: string,
    foreignField: string
  ) => {
    try {
      const data = await fetchForeignResource(foreignResource);
      setForeignkeyData((prev) => ({
        ...prev,
        [foreignResource]: data,
      }));
    } catch (err) {
      console.error(`Error fetching foreign data for ${fieldName}:`, err);
    }
  };

  // Fetch enum data function
  const fetchEnumData = async (enumName: string) => {
    try {
      const data = await fetchEnum(enumName);
      setEnums((prev) => ({
        ...prev,
        [enumName]: data,
      }));
    } catch (err) {
      console.error(`Error fetching enum data for ${enumName}:`, err);
    }
  };

  // Metadata query
  const {
    data: metaData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resMetaData"],
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const res = await fetch(metadataUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch metadata: ${res.statusText}`);
      }

      const data = await res.json();
      setFields(data[0].fieldValues);

      const foreignFields = data[0].fieldValues.filter(
        (field: any) => field.foreign
      );
      for (const field of foreignFields) {
        if (!fetchedResources.current.has(field.foreign)) {
          fetchedResources.current.add(field.foreign);
          queryClient.prefetchQuery({
            queryKey: ["foreignData", field.foreign],
            queryFn: () => fetchForeignResource(field.foreign),
          });
          await fetchForeignData(
            field.foreign,
            field.name,
            field.foreign_field
          );
        }
      }

      const enumFields = data[0].fieldValues.filter(
        (field: any) => field.isEnum === true
      );
      for (const field of enumFields) {
        if (!fetchedEnum.current.has(field.possible_value)) {
          fetchedEnum.current.add(field.possible_value);
          queryClient.prefetchQuery({
            queryKey: ["enum", field.possible_value],
            queryFn: () => fetchEnum(field.possible_value),
          });
          await fetchEnumData(field.possible_value);
        }
      }

      return data;
    },
  });

  const findMatchingMealId = (): string | null => {
    if (
      !mealSelection.Date ||
      !mealSelection.Meal_type ||
      mealData.length === 0
    ) {
      return null;
    }

    const selectedDate = new Date(mealSelection.Date)
      .toISOString()
      .split("T")[0];

    const matchingMeal = mealData.find((meal) => {
      const mealDate = new Date(meal.Date).toISOString().split("T")[0];
      return (
        mealDate === selectedDate && meal.Meal_type === mealSelection.Meal_type
      );
    });

    return matchingMeal?.id || null;
  };

  const handleCreate = async () => {
    const mealId = findMatchingMealId();

    if (!mealId) {
      alert("No meal available for the selected date and meal type");
      return;
    }

    const accessToken = getCookie("access_token");
    if (!accessToken) {
      throw new Error("Access token not found");
    }

    try {
      const params = new URLSearchParams();
      const accessToken = getCookie("access_token");
      const decodedJwt: any = jwtDecode(accessToken || "");
      const email = decodedJwt.email || "";
      const userId = userData.find(user => user.Email === email)?.id || "";
      const submissionData = {
        User_id: userId,
        Meal_id: mealId,
        Instruction: dataToSave.Instruction,
      };

      console.log("Submission Data:", submissionData);

      const jsonString = JSON.stringify(submissionData);
      const base64Encoded = btoa(jsonString);
      params.append("resource", base64Encoded);

      const response = await fetch(apiUrl + `?` + params.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/");
        }, 3000);
        // setDataToSave({ User_id: HARDCODED_USER_ID });
        setMealSelection({ Date: "", Meal_type: "" });
      }
    } catch (error) {
      console.error("Error submitting meal request:", error);
      alert("Error submitting meal request");
    }
  };

  const handleSearchChange = (fieldName: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow w-100" style={{ maxWidth: "600px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">Request Sick Meal</h4>
        </div>
        <div className="card-body">
          {/* Date Input */}
          <div className="mb-3">
            <label className="form-label">
              <span className="text-danger">*</span> Date
            </label>
            <input
              type="date"
              className="form-control"
              required
              value={mealSelection.Date}
              onChange={(e) =>
                setMealSelection({ ...mealSelection, Date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Meal Type Select */}
          <div className="mb-3">
            <label className="form-label">
              <span className="text-danger">*</span> Meal Type
            </label>
            <select
              className="form-select"
              required
              value={mealSelection.Meal_type}
              onChange={(e) =>
                setMealSelection({
                  ...mealSelection,
                  Meal_type: e.target.value,
                })
              }
            >
              <option value="">Select Meal Type</option>
              {mealTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Other fields */}
          {fields.map((field, index) => {
            if (
              field.name !== "id" &&
              !regex.test(field.name) &&
              field.name !== "User_id" &&
              field.name !== "Meal_id"
            ) {
              if (field.name === "Instruction") {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>}{" "}
                      {field.name}
                    </label>
                    <textarea
                      className="form-control"
                      name={field.name}
                      required={field.required}
                      placeholder={`Enter ${field.name}`}
                      value={dataToSave[field.name] || ""}
                      onChange={(e) =>
                        setDataToSave({
                          ...dataToSave,
                          [e.target.name]: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                );
              }
            }
            return null;
          })}

          <button className="btn btn-success w-100 mt-3" onClick={handleCreate}>
            Request Meal
          </button>

          {/* <div>
            {decodedJwt.email} <br />
            {userData.map((user) => (
              <div key={user.id}>
                <strong>Email:</strong> {user.Email} {user.Email == decodedJwt.email ? `${user.id}` : ""} <br />
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="toast-container position-fixed top-50 start-50 translate-middle p-3"
          style={{ zIndex: 2000 }}
        >
          <div className="toast show bg-light border-success" role="alert">
            <div className="toast-header">
              <strong className="me-auto text-success">Success</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body text-success text-center">
              Meal request submitted successfully!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSick_meal;
