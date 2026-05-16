import axios from 'axios';

import {
  API_URL,
} from '../config/constants';

console.log(
  'API_URL',
  API_URL
);

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (
  token
) => {
  if (token) {
    api.defaults.headers.common.Authorization =
      `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common
      .Authorization;
  }
};

api.interceptors.request.use(
  (config) => {
    return config;
  },

  (error) =>
    Promise.reject(error)
);

export default api;