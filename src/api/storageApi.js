import apiClient from './apiClient';

export const storageApi = {
    // Apps
    getApps: () => apiClient.get(`/admin/apps`),
    createApp: (payload) => apiClient.post('/admin/apps', payload),
    updateApp: (id, data) => apiClient.put(`/admin/apps/${id}`, data),
    deleteApp: (id) => apiClient.delete(`/admin/apps/${id}`),
    
    // Buckets
    getAllBuckets: (appId) => apiClient.get(`/admin/buckets`),
    getBucketById: (bucketId) => apiClient.get(`/admin/buckets/${bucketId}`),
    getBuckets: (appId) => apiClient.get(`/admin/buckets/app/${appId}`),
    registerBucket: (data) => apiClient.post(`/admin/buckets`, data),
    getFilesByBucket: (bucketId) => apiClient.get(`/admin/buckets/${bucketId}/files`),
    getFileContent: (fileId) => apiClient.get(`/files/view/${fileId}`, {
        responseType: 'blob',
        validateStatus: (status) => status >= 200 && status < 300
        }),
};