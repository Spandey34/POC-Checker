import api from './api';

export const userSearch = (q) =>
  api.get('/pocs/search', { params: { q } }).then((r) => r.data);

export const adminSearch = (q) =>
  api.get('/pocs/admin-search', { params: { q } }).then((r) => r.data);

export const getAllPOCs = (branch, cursor = 0, limit = 20) => {
  const params = {};
  if (branch) params.branch = branch;
  if (cursor !== null) params.cursor = cursor;
  if (limit) params.limit = limit;
  return api.get('/pocs', { params }).then((r) => r.data);
};

export const getRecentPOCs = () =>
  api.get('/pocs/recent').then((r) => r.data);

export const getBranches = () =>
  api.get('/pocs/branches').then((r) => r.data);

export const addPOC = (data) =>
  api.post('/pocs', data).then((r) => r.data);

export const updatePOC = (id, data) =>
  api.put(`/pocs/${id}`, data).then((r) => r.data);

export const deletePOC = (id) =>
  api.delete(`/pocs/${id}`).then((r) => r.data);