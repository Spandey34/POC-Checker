import api from './api';

export const getMe = () => api.get('/users/me').then((r) => r.data);

export const getAllUsers = async (cursor = null, limit = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (limit) params.append('limit', limit);
  
  const res = await api.get(`/users?${params.toString()}`);
  return res.data;
};

export const toggleVerification = (userId) =>
  api.patch(`/users/${userId}/toggle-verify`).then((r) => r.data);
