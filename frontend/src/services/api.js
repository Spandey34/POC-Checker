import axios from 'axios';

import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
});

let getTokenFn = null;

export const injectTokenGetter = (
  fn
) => {
  getTokenFn = fn;
};

api.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      const token =
        await getTokenFn();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

export default api;