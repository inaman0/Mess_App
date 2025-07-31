import React, { useState } from 'react';
                  import { useEffect } from 'react';
                  import apiConfig from '../../config/apiConfig';
                   import {
              AllCommunityModule,
              ModuleRegistry,
              themeAlpine,
              themeBalham,
            } from "ag-grid-community";
            import { AgGridReact } from "ag-grid-react";
            import { useQuery } from '@tanstack/react-query';
         
            ModuleRegistry.registerModules([AllCommunityModule]);
                  export type ResourceMetaData = {
                    "resource": string,
                    "fieldValues":any[]
                  }

                  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };
  
                  const ReadMenu_item= () => {
    const [rowData, setRowData] = useState<any[]>([]);
    const [colDef1, setColDef1] = useState<any[]>([]);
    const [resMetaData, setResMetaData] = useState<ResourceMetaData[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [dataToSave, setDataToSave] = useState<any>({});
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [fetchData, setFetchedData] = useState<any[]>([]);
   const [showToast,setShowToast] = useState<any>(false);

  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = `${apiConfig.getResourceUrl('menu_item')}?`
  const metadataUrl = `${apiConfig.getResourceMetaDataUrl('Menu_item')}?`
  const BaseUrl = '${apiConfig.API_BASE_URL}';
  // Fetch resource data
  
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
      setFetchedData(data.resource || []);
      // return data;
    },
  })

  

  const {data: dataResMeta,isLoading:isLoadingDataResMeta,error:errorDataResMeta} = useQuery({
    queryKey: ['resourceMetaData', 'menu_item'],
   queryFn: async () => {
      const response = await fetch(
        `${apiConfig.getResourceMetaDataUrl('menu_item')}?`,
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
      setFields(data[0]?.fieldValues || []);
      const required = data[0]?.fieldValues
        .filter((field: any) => !regex.test(field.name))
        .map((field: any) => field.name);
      setRequiredFields(required || []);
      return data;
    },
  });

  useEffect(() => {
    
    const data = fetchData || [];
    const fields = requiredFields.filter(field => field !== 'id') || [];
    
    const columns = fields.map(field => ({
      field: field,
      headerName: field,
      editable: false,
      resizable: true,
      sortable: true,
      filter: true
    }));
    
    setColDef1(columns);
    setRowData(data);
  }, [fetchData, requiredFields]);

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    editable: false,
  }; 

  return (
    <div>
       


<div >
    {rowData.length === 0 && colDef1.length === 0 ? (
      <div>No data available. Please add a resource attribute.</div>
    ) : (
      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDef1}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        animateRows={true}
        rowSelection="multiple"
      />
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
    
    export default ReadMenu_item