
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page1.css";
        
          import CreateMeal from './Resource/CreateMeal';
          
          import ReadMeal from './Resource/ReadMeal';
          
          import UpdateMeal from './Resource/UpdateMeal';
          export default function Page1() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-1"><CreateMeal/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-3"><ReadMeal/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-5"><UpdateMeal/></div>
            </>
          );
        }