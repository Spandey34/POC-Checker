import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({ baseURL: API_URL });

// Attach Clerk token to every request
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
