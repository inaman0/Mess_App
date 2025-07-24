import React, { useState } from 'react';
import apiConfig from '../../config/apiConfig';
import { FaStar } from 'react-icons/fa';
import './ReviewCardStyles.css';
import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';

interface MenuItemCardProps {
  Dish_name: string;
  type: string;
  id: string;
  mealType: string;
  isFeast: boolean;
}

interface Review {
  id: string;
  rating: string;
  Menu_item_id: string;
  User_id: string;
}

interface UserData {
  id: string;
  Name?: string;
  Email?: string;
  Room_no?: string;
  [key: string]: any;
}

const ratingStartTimes = {
  Breakfast: 8,
  Lunch: 13,
  Snacks: 17,
  Dinner: 20
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const ReviewMenuCard: React.FC<MenuItemCardProps> = ({ Dish_name, type, id, mealType, isFeast }) => {
  const [newRating, setNewRating] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const apiReviewUrl = apiConfig.getResourceUrl('review');
  const userApiUrl = `${apiConfig.getResourceUrl('user')}?`;

  // Check if rating is allowed based on current time
  const checkRatingAvailability = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = ratingStartTimes[mealType as keyof typeof ratingStartTimes] || 0;
    return currentHour >= startHour;
  };

  const ratingAllowed = checkRatingAvailability();

  // Get current user's email from JWT
  const accessToken = getCookie("access_token");
  const decodedJwt: any = accessToken ? jwtDecode(accessToken) : { email: '' };

  // Fetch user data to get the correct user ID
  const { data: userData } = useQuery<UserData[]>({
    queryKey: ['userDataForReview'],
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const params = new URLSearchParams();
      params.append("queryId", "GET_ALL");

      const response = await fetch(
        userApiUrl + params.toString(),
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
      return data.resource || [];
    },
  });

  // Get the current user's ID
  const currentUserId = userData?.find(user => user.Email === decodedJwt.email)?.id || '';

  // Fetch reviews using useQuery
  const { 
    data: reviews, 
    isLoading, 
    error: fetchError,
    refetch 
  } = useQuery<Review[]>({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const response = await fetch(
        `${apiReviewUrl}?queryId=GET_ALL`,
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
        throw new Error('Failed to fetch reviews');
      }

      const reviewData = await response.json();
      return reviewData.resource || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Check if user has already reviewed this item
  const hasReviewed = reviews?.some(
    (review) => review.Menu_item_id === id && review.User_id === currentUserId
  ) || false;

  const handleStarClick = (ratingValue: number) => {
    if (ratingAllowed) {
      setNewRating(ratingValue.toString());
    }
  };

  const handleSubmitReview = async () => {
    if (!ratingAllowed) {
      const startHour = ratingStartTimes[mealType as keyof typeof ratingStartTimes] || 0;
      setSubmitError(`Ratings for ${mealType} will open at ${startHour}:00`);
      return;
    }

    if (!newRating) {
      setSubmitError('Please select a rating');
      return;
    }

    if (hasReviewed) {
      setSubmitError('You have already rated this item');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const accessToken = getCookie("access_token");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      // Prepare the data with the current user's ID
      const reviewData = {
        User_id: currentUserId,
        Menu_item_id: id,
        Ratings: newRating,
      };

      // Convert to base64 encoded string
      const params = new URLSearchParams();
      const jsonString = JSON.stringify(reviewData);
      const base64Encoded = btoa(jsonString);
      params.append('resource', base64Encoded);

      const response = await fetch(apiReviewUrl + `?` + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setSubmitSuccess(true);
      setNewRating(null);
      // Refresh the reviews to update the UI
      await refetch();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="loading-message">Loading...</div>;
  if (fetchError) return <div className="error-message">{(fetchError as Error).message}</div>;

  return (
    <div 
      className={`review-card ${isFeast ? 'feast' : ''}`}
      data-meal-type={mealType}
    >
      <div className="dish-info-container">
        <h3 className="dish-name">{Dish_name}</h3>
        <p className={`dish-type ${type === 'VEG' ? 'dish-type-veg' : 'dish-type-nonveg'}`}>
          {type}
        </p>
      </div>
      
      {!ratingAllowed && (
        <div className="rating-notice">
          Ratings for {mealType} will open at {ratingStartTimes[mealType as keyof typeof ratingStartTimes] || 0}:00
        </div>
      )}
      
      {submitError && <div className="error-message">{submitError}</div>}
      
      {hasReviewed ? (
        <div className="already-rated">You have already rated this item</div>
      ) : (
        <>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((ratingValue) => (
              <FaStar
                key={ratingValue}
                className={`star ${ratingAllowed ? '' : 'disabled'} ${
                  newRating && ratingValue <= parseInt(newRating) ? 'active' : ''
                }`}
                onClick={() => handleStarClick(ratingValue)}
              />
            ))}
          </div>
          
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting || submitSuccess || hasReviewed || !ratingAllowed}
            className={`submit-button ${
              submitSuccess ? 'submit-success' : ''
            }`}
          >
            {submitSuccess ? 'Submitted!' : 
             hasReviewed ? 'Already Rated' : 
             !ratingAllowed ? 'Ratings Not Open Yet' : 
             isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewMenuCard;