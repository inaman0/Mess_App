import React, { useState } from 'react';
import './FileUploader.css';
import { handleFileUpload, MealPlan, submitMealPlansToMongo } from '../utils/excelParser';

interface MealUploaderProps {
  uploadUrlMeal: string;
  acceptedFileType: string;
  uploadUrlMenuItem: string;
  readMealUrl: string;
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export default function FileUploader({ uploadUrlMeal, uploadUrlMenuItem, readMealUrl }: MealUploaderProps) {
  const [excelData, setExcelData] = useState<MealPlan[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false); 

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      const data = await handleFileUpload(file);
      setExcelData(data);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      setSelectedFile(file);
      const data = await handleFileUpload(file);
      setExcelData(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus('');
    setShowStatus(true);

    if (!excelData) {
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    const accessToken = getCookie("access_token");
    if (!accessToken) {
      setUploadStatus('error');
      setIsUploading(false);
      return;
    }

    const result = await submitMealPlansToMongo(
      excelData, 
      uploadUrlMeal, 
      uploadUrlMenuItem, 
      readMealUrl, 
      accessToken
    );
    setUploadStatus(result);
    setIsUploading(false);
    if (result === 'success') {
      setExcelData(null);
      setSelectedFile(null);
    }
  };

  const getStatusMessage = () => {
    if (!showStatus) return null;

    const handleClose = () => {
      setShowStatus(false);
      setSelectedFile(null);
      setExcelData(null);
      setUploadStatus('');
      setIsUploading(false);
      setIsDragActive(false);
    };

    let className = '';
    let message = '';

    if (uploadStatus === 'success') {
      className = 'status-box success';
      message = 'Upload successful!';
    } else if (uploadStatus === 'partial') {
      className = 'status-box warning';
      message = 'Partially uploaded.';
    } else if (uploadStatus === 'error') {
      className = 'status-box error';
      message = 'Upload failed.';
    } else {
      return null;
    }

    return (
      <div className={className}>
        <span>{message}</span>
        <button className="close-btn" onClick={handleClose}>✕</button>
      </div>
    );
  };

  return (
    <>
      <h2 className='title'>Upload Menu</h2> 
      <div className="uploader-wrapper">
        {getStatusMessage()}
        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`drop-area ${isDragActive ? 'drag-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".xlsx" 
              onChange={handleFileSelect} 
              id="fileInput" 
              className="hidden-input" 
            />
            <label htmlFor="fileInput" className="file-label">
              <div className="drop-message">
                <div className="drop-icon">📂</div>
                <div className="drop-text">
                  {selectedFile ? selectedFile.name : 'Drag & drop .xlsx here or click to browse'}
                </div>
                <div className="drop-subtext">Only .xlsx files are supported</div>
              </div>
            </label>
          </div>
          <button 
            type="submit" 
            className="upload-button" 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </>
  );
}