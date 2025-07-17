import React, { useState } from 'react';
import { useEffect } from 'react';
import apiConfig from '../../config/apiConfig';
import { useQuery } from '@tanstack/react-query';
import "./ReadFeedback.css"; // Make sure to create this CSS file

export type ResourceMetaData = {
  resource: string;
  fieldValues: any[];
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const ReadFeedback = () => {
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [resMetaData, setResMetaData] = useState<ResourceMetaData[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const itemsPerPage = 5;
  const regex = /^(g_|archived|extra_data)/;
  const apiUrl = `${apiConfig.getResourceUrl('feedback')}?`;
  const metadataUrl = `${apiConfig.getResourceMetaDataUrl('Feedback')}?`;

  // Fetch resource data using React Query
  const { data: dataRes, isLoading: isLoadingDataRes, error: errorDataRes } = useQuery({
    queryKey: ['resourceData', 'feedback'],
    queryFn: async () => {
      const params = new URLSearchParams();
      const queryId: any = "GET_ALL";
      params.append("queryId", queryId);

      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        `${apiConfig.getResourceUrl('feedback')}?` + params.toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error: " + response.status);
      }

      const data = await response.json();
      setFeedbackData(data.resource || []);
      return data;
    },
  });

  // Fetch metadata using React Query
  const { data: dataResMeta, isLoading: isLoadingDataResMeta, error: errorDataResMeta } = useQuery({
    queryKey: ['resourceMetaData', 'feedback'],
    queryFn: async () => {
      const response = await fetch(
        `${apiConfig.getResourceMetaDataUrl('feedback')}?`,
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
      return data;
    },
  });

  const displayFields = fields.filter(
    (field) => !regex.test(field.name) && field.name !== "id"
  );

  // Pagination logic
  const totalPages = Math.ceil(feedbackData.length / itemsPerPage);
  const paginatedData = feedbackData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2>Student Feedback</h2>
      </div>

      {paginatedData.length === 0 ? (
        <div className="alert">No feedback data available.</div>
      ) : (
        <div className="feedback-grid">
          {paginatedData.map((feedback, index) => (
            <div key={index} className="feedback-card">
              {displayFields.map((field) => (
                <div key={field.name} className="feedback-item">
                  <strong>{field.name}:</strong>{" "}
                  {field.name === "Image" && feedback[field.name] ? (
                    <img
                      src={feedback[field.name].replace(/\s/g, "+")}
                      alt="Feedback"
                      className="feedback-image"
                      onClick={() =>
                        setSelectedImage(
                          feedback[field.name].replace(/\s/g, "+")
                        )
                      }
                    />
                  ) : field.name.toLowerCase() === "description" ||
                    field.name.toLowerCase() === "feedback" ? (
                    <div className="feedback-text-scroll">
                      <span>{feedback[field.name] || "N/A"}</span>
                    </div>
                  ) : field.name.toLowerCase().includes("date") ? (
                    <span>
                      {feedback[field.name]
                        ? new Date(feedback[field.name]).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </span>
                  ) : (
                    <span>{feedback[field.name] || "N/A"}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span className="page-count">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content">
            <img src={selectedImage} alt="Full Feedback" />
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadFeedback;