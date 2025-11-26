import api from './axios';

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// Users
export const getUsers = () => api.get('/users/');
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Machines
export const getMachines = () => api.get('/machines/');
export const createMachine = (data) => api.post('/machines/', data);
export const updateMachine = (id, data) => api.put(`/machines/${id}`, data);
export const deleteMachine = (id) => api.delete(`/machines/${id}`);

// Tasks
export const getTasks = (month = null, year = null) => {
    const params = {};
    if (month !== null) params.month = month;
    if (year !== null) params.year = year;
    return api.get('/tasks/', { params });
};
export const createTask = (data) => api.post('/tasks/', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Task Workflow Actions
export const startTask = (id) => api.post(`/tasks/${id}/start`);
export const holdTask = (id, reason) => api.post(`/tasks/${id}/hold`, { reason });
export const resumeTask = (id) => api.post(`/tasks/${id}/resume`);
export const completeTask = (id) => api.post(`/tasks/${id}/complete`);
export const denyTask = (id, reason) => api.post(`/tasks/${id}/deny`, { reason });

// Analytics
export const getAnalytics = () => api.get('/analytics/');

// Outsource
// Outsource
export const getOutsource = () => api.get('/outsource/');
export const createOutsource = (data) => api.post('/outsource/', data);
export const updateOutsource = (id, data) => api.put(`/outsource/${id}`, data);
export const deleteOutsource = (id) => api.delete(`/outsource/${id}`);

// Planning
export const getPlanningTasks = () => api.get('/planning/');
export const createPlanningTask = (data) => api.post('/planning/', data);
export const updatePlanningTask = (id, data) => api.put(`/planning/${id}`, data);
export const deletePlanningTask = (id) => api.delete(`/planning/${id}`);
