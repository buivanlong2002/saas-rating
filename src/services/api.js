// API service for review token system
import { API_BASE, getApiHeaders, ERROR_MESSAGES, HTTP_STATUS_MESSAGES, RESPONSE_CODES } from '../config/api.js';



// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Get review info by token
  async getReviewInfo(token) {
    await delay(1000); // Simulate network delay
    
    if (!token || token.length !== 32) {
      throw new Error('Invalid token format');
    }
    
    const reviewData = mockReviewData[token];
    
    if (!reviewData) {
      throw new Error('Token not found');
    }
    
    return {
      success: true,
      data: reviewData
    };
  },

  // Submit review
  async submitReview(token, rating, feedback, reviewType) {
    await delay(1500); // Simulate network delay
    
    if (!token || token.length !== 32) {
      throw new Error('Invalid token format');
    }
    
    const reviewData = mockReviewData[token];
    
    if (!reviewData) {
      throw new Error('Token not found');
    }
    
    if (!reviewData.tokenValid) {
      throw new Error('Token is not valid');
    }
    
    if (reviewData.tokenStatus !== 'PENDING') {
      throw new Error('Token has already been used');
    }
    
    // Simulate successful submission
    return {
      success: true,
      message: 'Review submitted successfully',
      data: {
        reviewId: `REV_${Date.now()}`,
        submittedAt: new Date().toISOString()
      }
    };
  }
};

// Real API endpoints - Spring Boot Backend
export const realApiService = {
  async getReviewInfo(token) {
    try {
      const response = await fetch(`${API_BASE}/review-tokens/review-info/${token}`, {
        headers: getApiHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage = HTTP_STATUS_MESSAGES[response.status] || `HTTP error! status: ${response.status}`;
        throw new Error(errorData.message || statusMessage);
      }
      
      const data = await response.json();
      
      // Transform Spring Boot ApiResponse to frontend format
      console.log('Processing response:', data);
      
      // Check if response is successful using Spring Boot ResponseCode
      if (data.code === RESPONSE_CODES.SUCCESS) {
        if (data.data) {
          return {
            success: true,
            data: {
              customerName: data.data.customerName,
              customerPhone: data.data.customerPhone,
              customerEmail: data.data.customerEmail,
              salonName: data.data.salonName,
              salonAddress: data.data.salonAddress,
              visitDate: data.data.visitDate,
              visitId: data.data.visitId,
              customerId: data.data.customerId,
              salonId: data.data.salonId,
              reviewLink: data.data.reviewLink,
              tokenValid: data.data.tokenValid,
              tokenStatus: data.data.tokenStatus
            }
          };
        } else {
          // Success but no data - this might be an error case
          throw new Error(data.message || 'No data received from server');
        }
      } else {
        // Error response
        throw new Error(data.message || ERROR_MESSAGES.VALIDATION_ERROR);
      }
    } catch (error) {
      console.error('API Error (getReviewInfo):', error);
      throw new Error(error.message || ERROR_MESSAGES.NETWORK_ERROR);
    }
  },

  async submitReview(token, rating, feedback, reviewType) {
    try {
      // Tạo form data để gửi như @RequestParam
      const formData = new URLSearchParams();
      formData.append('token', token);
      formData.append('rating', rating.toString());
      formData.append('feedback', feedback);
      if (reviewType) {
        formData.append('reviewType', reviewType);
      }

      const response = await fetch(`${API_BASE}/review-tokens/submit-review`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'vi-VN',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage = HTTP_STATUS_MESSAGES[response.status] || `HTTP error! status: ${response.status}`;
        throw new Error(errorData.message || statusMessage);
      }
      
      const data = await response.json();
      
      // Transform Spring Boot ApiResponse to frontend format
      console.log('Backend response:', data); // Debug log
      
      if (data.code === RESPONSE_CODES.SUCCESS && data.data) {
        return {
          success: true,
          message: data.message || 'Review submitted successfully',
          data: {
            reviewId: data.data.id || `REV_${Date.now()}`,
            submittedAt: data.data.reviewAt || new Date().toISOString(),
            customerName: data.data.customerName,
            salonName: data.data.salonName,
            rating: data.data.rating,
            feedback: data.data.feedback
          }
        };
      } else {
        throw new Error(data.message || ERROR_MESSAGES.VALIDATION_ERROR);
      }
    } catch (error) {
      console.error('API Error (submitReview):', error);
      throw new Error(error.message || ERROR_MESSAGES.SUBMIT_ERROR);
    }
  },

  // Additional API methods for future use
  async validateToken(token) {
    try {
      const response = await fetch(`${API_BASE}/review-tokens/validate/${token}`, {
        headers: getApiHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage = HTTP_STATUS_MESSAGES[response.status] || `HTTP error! status: ${response.status}`;
        throw new Error(errorData.message || statusMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (validateToken):', error);
      throw new Error(error.message || ERROR_MESSAGES.INVALID_TOKEN);
    }
  },

  async markTokenAsUsed(token) {
    try {
      const response = await fetch(`${API_BASE}/review-tokens/${token}/use`, {
        method: 'POST',
        headers: getApiHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage = HTTP_STATUS_MESSAGES[response.status] || `HTTP error! status: ${response.status}`;
        throw new Error(errorData.message || statusMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (markTokenAsUsed):', error);
      throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
};

// Export the service to use (switch between mock and real)
// export default apiService; // Use mock for development
export default realApiService; // Use real API for production
