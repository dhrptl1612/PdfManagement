// src/services/api.js
import axios from 'axios';

// Base API URL - change to your backend URL
const API_URL = 'https://pdfmanagement-54ay.onrender.com';

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
