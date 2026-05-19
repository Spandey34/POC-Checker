import api from './api'; // your axios instance

export const getRecentActivities = async () => {
  const res = await api.get('/recent');
  return res.data;
};