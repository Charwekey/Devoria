import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Assuming FastAPI default port
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // We'll store token in localStorage for simplicity as requested
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
