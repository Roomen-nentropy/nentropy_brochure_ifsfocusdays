import axios from 'axios';

export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://backend.joinnentropy.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 300000, // 5 minutes timeout for large operations
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 413) {
      // Payload too large error
      const message =
        error.response?.data?.message ||
        'File too large. Please try a smaller CSV file.';
      throw new Error(`Payload Too Large: ${message}`);
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred';
    throw new Error(message);
  }
);
