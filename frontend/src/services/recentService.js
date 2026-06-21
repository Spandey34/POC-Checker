import api from './api'; // your axios instance

export const getRecentActivities = async (cursor = null, limit = 20) => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (limit) params.append('limit', limit);
  
  const res = await api.get(`/recent?${params.toString()}`);
  return res.data;
};