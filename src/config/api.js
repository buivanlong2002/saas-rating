// API Configuration for Spring Boot backend
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

// API Headers
export const getApiHeaders = () => ({
  'Accept': 'application/json',
  'Accept-Language': 'vi-VN',
  'Content-Type': 'application/json'
});

// Error messages in Vietnamese
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
  INVALID_TOKEN: 'Link đánh giá không hợp lệ hoặc đã hết hạn',
  TOKEN_USED: 'Link đánh giá đã được sử dụng',
  TOKEN_EXPIRED: 'Link đánh giá đã hết hạn',
  SUBMIT_ERROR: 'Không thể gửi đánh giá. Vui lòng thử lại sau.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Có lỗi xảy ra, vui lòng thử lại'
};

// HTTP Status code mapping
export const HTTP_STATUS_MESSAGES = {
  400: 'Yêu cầu không hợp lệ',
  401: 'Không có quyền truy cập',
  403: 'Truy cập bị từ chối',
  404: 'Không tìm thấy tài nguyên',
  409: 'Token đã được sử dụng',
  422: 'Dữ liệu không hợp lệ',
  500: 'Lỗi server',
  502: 'Lỗi kết nối server',
  503: 'Server tạm thời không khả dụng',
  504: 'Hết thời gian kết nối'
};

// Spring Boot ResponseCode mapping
export const RESPONSE_CODES = {
  SUCCESS: 0,  // Backend returns 0 for success
  SYSTEM_ERROR: 500,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409
};
