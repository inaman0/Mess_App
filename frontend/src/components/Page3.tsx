
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page3.css";
        
          import CreateUser from './Resource/CreateUser';
          
          import ReadUser from './Resource/ReadUser';
          
          import UpdateUser from './Resource/UpdateUser';
          export default function Page3() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-D"><CreateUser/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-F"><ReadUser/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-H"><UpdateUser/></div>
            </>
          );
        }