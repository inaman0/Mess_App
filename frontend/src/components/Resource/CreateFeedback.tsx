import React, { useState, useEffect, useRef } from 'react';
import apiConfig from '../../config/apiConfig';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchForeignResource } from '../../apis/resources';
import { fetchEnum } from '../../apis/enum';
import { ImageUploader } from '../../user/components/ImageUploader';
import {jwtDecode} from "jwt-decode";

export type resourceMetaData = {
  resource: string;
  fieldValues: any[];
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const CreateFeedback = () => {
  const [fields, setFields] = useState<any[]>([]);
  const [dataToSave, setDataToSave] = useState<any>({});
  const [showToast, setShowToast] = useState<boolean>(false);
  const [foreignkeyData, setForeignkeyData] = useState<Record<string, any[]>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [enums, setEnums] = useState<Record<string, any[]>>({});
  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = apiConfig.getResourceUrl("feedback");
  const metadataUrl = apiConfig.getResourceMetaDataUrl("Feedback");
  const navigate = useNavigate();
  
  const HARDCODED_USER_ID = "07a600cf-f4e0-461a-a7ea-17ec4185d159-56";
  const fetchedResources = useRef(new Set<string>());
  const fetchedEnum = useRef(new Set<string>());
  const queryClient = useQueryClient();

  // Set hardcoded user ID when component mounts
  useEffect(() => {
    setDataToSave({ ...dataToSave, User: HARDCODED_USER_ID });
  }, []);

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

      const foreignFields = data[0].fieldValues.filter((field: any) => field.foreign && field.name !== 'User');
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

      const enumFields = data[0].fieldValues.filter((field: any) => field.isEnum === true);
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
      console.log(jsonString);
      const base64Encoded = btoa(jsonString);
      params.append('resource', base64Encoded);
      console.log("Encoded Data:", base64Encoded);
      console.log(apiUrl + `?` + params.toString());
      console.log("Access Token:", accessToken);

      const decoded: any = jwtDecode(accessToken);
      const preferredUsername = decoded.preferred_username;

      console.log("Preferred Username:", preferredUsername);
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
        setDataToSave({ User: HARDCODED_USER_ID });
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
    <div className="container d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow w-100" style={{ maxWidth: '600px' }}>
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
                      value={dataToSave[field.name] || getFormattedDate()}
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
              } else if (field.foreign) {
                const options = foreignkeyData[field.foreign] || [];
                const filteredOptions = options.filter((option) =>
                  option[field.foreign_field].toLowerCase().includes((searchQueries[field.name] || '').toLowerCase())
                );

                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary form-control text-start dropdown-toggle"
                        type="button"
                        id={`dropdownMenu-${field.name}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {dataToSave[field.name]
                          ? options.find((item) => item[field.foreign_field] === dataToSave[field.name])?.[field.foreign_field] || 'Select'
                          : `Select ${field.name}`}
                      </button>
                      <div className="dropdown-menu w-100" aria-labelledby={`dropdownMenu-${field.name}`}>
                        <div className="px-2 py-1">
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder={`Search ${field.name}`}
                            value={searchQueries[field.name] || ''}
                            onChange={(e) => handleSearchChange(field.name, e.target.value)}
                          />
                        </div>
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map((option, i) => (
                            <button
                              key={i}
                              className="dropdown-item"
                              type="button"
                              onClick={() => {
                                setDataToSave({ ...dataToSave, [field.name]: option[field.foreign_field] });
                              }}
                            >
                              {option[field.foreign_field]}
                            </button>
                          ))
                        ) : (
                          <span className="dropdown-item text-muted">No options available</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              } else if (field.isEnum) {
                return (
                  <div key={index} className="mb-3">
                    <label className="form-label">
                      {field.required && <span className="text-danger">*</span>} {field.name}
                    </label>
                    <select
                      className="form-select"
                      name={field.name}
                      required={field.required}
                      value={dataToSave[field.name] || ''}
                      onChange={(e) =>
                        setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })
                      }
                    >
                      <option value="">Select {field.name}</option>
                      {enums[field.possible_value]?.map((enumValue: any, idx: number) => (
                        <option key={idx} value={enumValue}>
                          {enumValue}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              } else {
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
  );
};

export default CreateFeedback;