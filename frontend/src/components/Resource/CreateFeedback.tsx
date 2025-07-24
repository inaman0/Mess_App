import React, { useState, useEffect, useRef } from 'react';
import apiConfig from '../../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchForeignResource } from '../../apis/resources';
import { fetchEnum } from '../../apis/enum';
import { ImageUploader } from '../../user/components/ImageUploader';
import { jwtDecode } from "jwt-decode";

export type resourceMetaData = {
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

interface FeedbackData {
  User?: string;
  Description?: string;
  Date?: string;
  Image?: string;
  [key: string]: any;
}

interface Field {
  name: string;
  type: string;
  required: boolean;
  foreign?: string;
  foreign_field?: string;
  isEnum?: boolean;
  possible_value?: string;
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const CreateFeedback = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [dataToSave, setDataToSave] = useState<FeedbackData>({});
  const [showToast, setShowToast] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [foreignkeyData, setForeignkeyData] = useState<Record<string, any[]>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [enums, setEnums] = useState<Record<string, any[]>>({});
  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = apiConfig.getResourceUrl("feedback");
  const userApiUrl = `${apiConfig.getResourceUrl("user")}?`;
  const metadataUrl = apiConfig.getResourceMetaDataUrl("Feedback");
  const navigate = useNavigate();
  
  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  const accessToken = getCookie("access_token");
  const decodedJwt: any = jwtDecode(accessToken || "");

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

  // Set user ID when component mounts or userData changes
  useEffect(() => {
    if (userData.length > 0 && decodedJwt.email) {
      const userId = userData.find(user => user.Email === decodedJwt.email)?.id || "";
      setDataToSave((prev: FeedbackData) => ({ ...prev, User: userId }));
    }
  }, [userData, decodedJwt.email]);

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
  const { data: metaData, isLoading, error } = useQuery({
    queryKey: ['resMetaData'],
    queryFn: async () => {
      const res = await fetch(metadataUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch metadata: ${res.statusText}`);
      }

      const data = await res.json();
      setFields(data[0].fieldValues);

      const foreignFields = data[0].fieldValues.filter((field: Field) => field.foreign && field.name !== 'User');
      for (const field of foreignFields) {
        if (!fetchedResources.current.has(field.foreign)) {
          fetchedResources.current.add(field.foreign);
          queryClient.prefetchQuery({
            queryKey: ['foreignData', field.foreign],
            queryFn: () => fetchForeignResource(field.foreign),
          });
          await fetchForeignData(field.foreign, field.name, field.foreign_field);
        }
      }

      const enumFields = data[0].fieldValues.filter((field: Field) => field.isEnum === true);
      for (const field of enumFields) {
        if (!fetchedEnum.current.has(field.possible_value)) {
          fetchedEnum.current.add(field.possible_value);
          queryClient.prefetchQuery({
            queryKey: ['enum', field.possible_value],
            queryFn: () => fetchEnum(field.possible_value),
          });
          await fetchEnumData(field.possible_value);
        }
      }

      return data;
    },
  });

  const handleCreate = async () => {
    const accessToken = getCookie("access_token");
    if (!accessToken) {
      throw new Error("Access token not found");
    }

    try {
      const params = new URLSearchParams();
      const jsonString = JSON.stringify(dataToSave);
      const base64Encoded = btoa(jsonString);
      params.append('resource', base64Encoded);

      const response = await fetch(apiUrl + `?` + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate('/');
        }, 3000);
        setDataToSave({});
      } else {
        const errorText = await response.text();
        console.error("Error response:", response.status, errorText);
        alert(`Error creating feedback: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: Unable to submit feedback. Please check your connection and try again.");
    }
  };

  const handleSearchChange = (fieldName: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
  };

  const getFormattedDate = (): string => {
    const date = new Date(Date.now());
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  return (
    <div className='uploader-wrapper' style={{ width: '1500px'}}>
      <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow w-100" style={{ maxWidth: '600px',marginTop:'80px' }}>
        <div className="card-header bg-primary text-white text-center">
          <h4 className="mb-0">Create Feedback</h4>
        </div>
        <div className="card-body">
          {fields.map((field, index) => {
            if (field.name !== 'id' && !regex.test(field.name) && field.name !== 'User') {
              if (field.name === 'Description') {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <textarea
                      className="form-control"
                      name={field.name}
                      required={field.required}
                      placeholder={field.name}
                      value={dataToSave[field.name] || ''}
                      onChange={(e) => setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })}
                      rows={3}
                    />
                  </div>
                );
              } else if (field.name === 'Date') {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <input
                      type={field.type}
                      className="form-control"
                      name={field.name}
                      required={field.required}
                      placeholder={field.name}
                      value={dataToSave[field.name] || ''}
                      onChange={(e) => setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })}
                    />
                  </div>
                );
              } else if (field.name === 'Image') {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <ImageUploader
                      value={dataToSave[field.name] || ''}
                      onChange={(dataUrl) => {
                        setDataToSave({ ...dataToSave, [field.name]: dataUrl });
                      }}
                      required={field.required}
                    />
                  </div>
                );
              } 
              else {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <input
                      type={field.type}
                      className="form-control"
                      name={field.name}
                      required={field.required}
                      placeholder={field.name}
                      value={dataToSave[field.name] || ''}
                      onChange={(e) =>
                        setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })
                      }
                    />
                  </div>
                );
              }
            }
            return null;
          })}
          <button className="btn btn-success w-100 mt-3" onClick={handleCreate}>
            Submit Feedback
          </button>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-container position-fixed top-50 start-50 translate-middle p-3" style={{ zIndex: 2000 }}>
          <div className="toast show bg-light border-success" role="alert">
            <div className="toast-header">
              <strong className="me-auto text-success">Success</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body text-success text-center">Feedback submitted successfully!</div>
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
};

export default CreateFeedback;