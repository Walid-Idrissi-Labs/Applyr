import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/password', data),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
};

export const applicationsAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getDashboard: () => api.get('/applications/dashboard'),
  getOne: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
};

export const tasksAPI = {
  getAll: (applicationId) => api.get(`/applications/${applicationId}/tasks`),
  create: (applicationId, data) => api.post(`/applications/${applicationId}/tasks`, data),
  update: (applicationId, id, data) => api.put(`/applications/${applicationId}/tasks/${id}`, data),
  delete: (applicationId, id) => api.delete(`/applications/${applicationId}/tasks/${id}`),
};

export const documentsAPI = {
  getAll: (applicationId) => api.get(`/applications/${applicationId}/documents`),
  upload: (applicationId, formData) => api.post(`/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  download: (applicationId, id) => api.get(`/applications/${applicationId}/documents/${id}/download`, {
    responseType: 'blob',
  }),
  delete: (applicationId, id) => api.delete(`/applications/${applicationId}/documents/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  delete: (id) => api.delete(`/tags/${id}`),
};

export const resumesAPI = {
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  exportPdf: (id) => api.get(`/resumes/${id}/export-pdf`),
  generateWithAi: (id) => api.post(`/resumes/${id}/generate`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivate: (id) => api.patch(`/admin/users/${id}/deactivate`),
  activate: (id) => api.patch(`/admin/users/${id}/activate`),
  grantAdmin: (id) => api.patch(`/admin/users/${id}/grant-admin`),
  revokeAdmin: (id) => api.patch(`/admin/users/${id}/revoke-admin`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAiLogs: (params) => api.get('/admin/ai-logs', { params }),
};

export const aiAPI = {
  extractJob: (html, url) => api.post('/ai/extract-job', { html, url }),
};

export default api;