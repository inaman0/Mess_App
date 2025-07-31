
        import React, { useState, useEffect } from 'react';
         import { useNavigate } from 'react-router-dom';
        import "./Page5.css";
        
          import CreateReview from './Resource/CreateReview';
          
          import ReadReview from './Resource/ReadReview';
          
          import UpdateReview from './Resource/UpdateReview';
          export default function Page5() { 
          const navigate = useNavigate();

          return (
            <>
            <div className="d-flex flex-column border border-2 h-50" id="id-P"><CreateReview/></div>
            {/* <div className="d-flex flex-column border border-2 h-50" id="id-R"><ReadReview/></div> */}
            <div className="d-flex flex-column border border-2 h-50" id="id-T"><UpdateReview/></div>
            </>
          );
        }