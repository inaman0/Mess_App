
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page6.css";
        
          import CreateFeedback from './Resource/CreateFeedback';
          
          import ReadFeedback from './Resource/ReadFeedback';
          
          import UpdateFeedback from './Resource/UpdateFeedback';
          export default function Page6() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-V"><CreateFeedback/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-X"><ReadFeedback/></div>
            <div className="d-flex flex-column border border-2 h-50" id="id-Z"><UpdateFeedback/></div>
            </>
          );
        }