import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('le_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
