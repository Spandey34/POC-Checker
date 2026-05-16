import api from './api';

export const getMe = () => api.get('/users/me').then((r) => r.data);

export const getAllUsers = () => api.get('/users').then((r) => r.data);

export const toggleVerification = (userId) =>
  api.patch(`/users/${userId}/toggle-verify`).then((r) => r.data);
