import api from './api';

const authService = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password
    });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService;

