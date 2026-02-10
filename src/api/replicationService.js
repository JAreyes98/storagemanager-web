// Change Request: Replication Rules Service
import api from '../api/apiClient';

// Change Request: Global Replication Fetch
const replicationService = {
  getAllRules: () => api.get('/admin/replication'),
  createRule: (data) => api.post('/admin/replication', data),
  deleteRule: (id) => api.delete(`/admin/replication/${id}`),
  toggleRule: (id) => api.patch(`/admin/replication/${id}/toggle`)
};

export default replicationService;