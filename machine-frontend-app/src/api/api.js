import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const getMachines = () => api.get('/machines');
export const getMachine = (id) => api.get(`/machines/${id}`);
export const getConsent = (id) => api.get(`/machines/${id}/consent`);
export const addConsentRow    = (id, data)          => api.post(`/machines/${id}/consent`, data);
export const updateConsentRow = (id, rowId, data)   => api.put(`/machines/${id}/consent/${rowId}`, data);
export const deleteConsentRow = (id, rowId)         => api.delete(`/machines/${id}/consent/${rowId}`);
// legacy alias
export const updateConsent = addConsentRow;

export const getLayers = (id, layer) => api.get(`/machines/${id}/layers/${layer}`);
export const addMaterialEntry = (id, layer, data) => api.post(`/machines/${id}/layers/${layer}`, data);
export const updateMaterialEntry = (id, layer, entryId, data) => api.put(`/machines/${id}/layers/${layer}/${entryId}`, data);
export const deleteMaterialEntry = (id, layer, entryId) => api.delete(`/machines/${id}/layers/${layer}/${entryId}`);
export const seedMachines = () => api.post('/machines/seed');
