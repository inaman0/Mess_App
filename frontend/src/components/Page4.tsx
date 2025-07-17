
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page4.css";
        
          import CreateSick_meal from './Resource/CreateSick_meal';
          
          import ReadSick_meal from './Resource/ReadSick_meal';
          
          import UpdateSick_meal from './Resource/UpdateSick_meal';
          export default function Page4() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-J"><CreateSick_meal/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-L"><ReadSick_meal/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-N"><UpdateSick_meal/></div>
            </>
          );
        }