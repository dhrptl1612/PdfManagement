// src/services/api.js
import axios from 'axios';

// Base API URL - change to your backend URL
const API_URL =  process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL
});

// Add token to all requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default api;
