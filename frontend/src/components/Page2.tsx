
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page2.css";
        
          import CreateMenu_item from './Resource/CreateMenu_item';
          
          import ReadMenu_item from './Resource/ReadMenu_item';
          
          import UpdateMenu_item from './Resource/UpdateMenu_item';
          export default function Page2() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-7"><CreateMenu_item/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-9"><ReadMenu_item/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-B"><UpdateMenu_item/></div>
            </>
          );
        }