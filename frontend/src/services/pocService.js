import api from './api';

export const userSearch = (q) =>
  api.get('/pocs/search', { params: { q } }).then((r) => r.data);

export const adminSearch = (q) =>
  api.get('/pocs/admin-search', { params: { q } }).then((r) => r.data);

export const getAllPOCs = (branch) =>
  api.get('/pocs', { params: branch ? { branch } : {} }).then((r) => r.data);

export const getBranches = () => api.get('/pocs/branches').then((r) => r.data);

export const addPOC = (data) => api.post('/pocs', data).then((r) => r.data);

export const updatePOC = (id, data) => api.put(`/pocs/${id}`, data).then((r) => r.data);

export const deletePOC = (id) => api.delete(`/pocs/${id}`).then((r) => r.data);
