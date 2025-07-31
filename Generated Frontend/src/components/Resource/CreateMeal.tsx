import React, { useState, useEffect, useRef } from 'react';
    import apiConfig from '../../config/apiConfig';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchForeignResource } from '../../apis/resources';
import { fetchEnum } from '../../apis/enum';


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

const CreateMeal = () => {
const [resMetaData, setResMetaData] = useState<resourceMetaData[]>([]);
const [fields, setFields] = useState<any[]>([]);
  const [dataToSave, setDataToSave] = useState<any>({});
  const [showToast, setShowToast] = useState<any>(false);
  const [foreignkeyData, setForeignkeyData] = useState<Record<string, any[]>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
     const [enums, setEnums] = useState<Record<string, any[]>>({});
  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = apiConfig.getResourceUrl("meal")
  const metadataUrl = apiConfig.getResourceMetaDataUrl("Meal")
  
    const fetchedResources = useRef(new Set<string>());
const fetchedEnum = useRef(new Set<string>());
const queryClient = useQueryClient();


// ✅ async function, not useQuery
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

// ✅ async function, not useQuery
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

// ✅ useQuery only here
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

    setResMetaData(data);
    setFields(data[0].fieldValues);

    const foreignFields = data[0].fieldValues.filter((field: any) => field.foreign);
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


  useEffect(()=>{
    console.log("data to save",dataToSave)
  },[dataToSave])
 

  const handleCreate = async () => {
    const params = new URLSearchParams();
    const jsonString = JSON.stringify(dataToSave);
    const base64Encoded = btoa(jsonString);
    params.append('resource', base64Encoded);
   const accessToken = getCookie("access_token");

  if (!accessToken) {
    throw new Error("Access token not found");
  }

    
    const response = await fetch(apiUrl+`?`+params.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`, // Add token here
        
      },
      credentials: 'include', // include cookies if needed
    });

    if (response.ok) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setDataToSave({});
    }
  };

  const handleSearchChange = (fieldName: string, value: string) => {
    setSearchQueries((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div>
        

<div>
      
    <div className="container mt-4">
      {fields.map((field, index) => {
        if (field.name !== 'id' && !regex.test(field.name)) {
          if (field.foreign) {
            console.log("FK",foreignkeyData)
            const options = foreignkeyData[field.foreign] || [];
            const filteredOptions = options.filter((option) =>
              option[field.foreign_field].toLowerCase().includes((searchQueries[field.name] || '').toLowerCase())
            );
            console.log("fo",filteredOptions)
            console.log("ooo",options)
            return (
              <div key={index} className="dropdown">
                <label style={{ display: 'block' }}>
                  {field.required && <span style={{ color: 'red' }}>*</span>} {field.name}
                </label>
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id={`dropdownMenu-${field.name}`}
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {dataToSave[field.name]
                    ? options.find((item) => item[field.foreign_field] === dataToSave[field.name])?.[field.foreign_field] || 'Select'
                    : `Select ${field.name}`}
                </button>
                <div className="dropdown-menu" aria-labelledby={`dropdownMenu-${field.name}`}>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder={`Search ${field.name}`}
                    value={searchQueries[field.name] || ''}
                    onChange={(e) => handleSearchChange(field.name, e.target.value)}
                  />
                  
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
            );
          } else if (field.isEnum === true) {
              return (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block' }}>
                    {field.required && <span style={{ color: 'red' }}>*</span>} {field.name}
                  </label>
                  <select
                    name={field.name}
                    required={field.required}
                    value={dataToSave[field.name] || ''}
                    onChange={(e) => setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })}
                    style={{ padding: '5px', width: '100%' }}
                  >
                    <option value="">Select {field.name}</option>
                   {Object.keys(enums).length != 0 && enums[field.possible_value]!=undefined && enums[field.possible_value].map((enumValue: any,index:number) => (
                     <option key={index} value={enumValue}>
                       {enumValue}
                     </option>
                   ))}
                    </select>
                </div>
              );
            }
          else {
            return (
              <div key={index} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block' }}>
                  {field.required && <span style={{ color: 'red' }}>*</span>} {field.name}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  placeholder={field.name}
                  value={dataToSave[field.name] || ''}
                  onChange={(e) => setDataToSave({ ...dataToSave, [e.target.name]: e.target.value })}
                  style={{ padding: '5px', width: '100%' }}
                />
              </div>
            );
          }
        }
        return null;
      })}
      <button className="btn btn-success" onClick={handleCreate}>
        Create
      </button>
    </div>
    {showToast && (
      <div
        className="toast-container position-fixed top-20 start-50 translate-middle p-3"
        style={{ zIndex: 1550 }}
      >
        <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <strong className="me-auto">Success</strong>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="toast"
              aria-label="Close"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body text-success text-center">Created successfully!</div>
        </div>
      </div>
    )}
  </div>
  {showToast && (
    <div
      className="toast-container position-fixed top-20 start-50 translate-middle p-3"
      style={{ zIndex: 1550 }}
    >
      <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="toast-header">
          <strong className="me-auto">Success</strong>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
            onClick={() => setShowToast(false)}
          ></button>
        </div>
        <div className="toast-body text-success text-center">Created successfully!</div>
      </div>
    </div>
) }

</div>
)


};

export default CreateMeal