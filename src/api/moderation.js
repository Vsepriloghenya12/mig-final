export const moderationApi = {
  report: (api, payload) => api.post('/api/reports', payload),
  blockUser: (api, targetId) => api.post('/api/block-user', { targetId }),
  unblockUser: (api, targetId) => api.post('/api/unblock-user', { targetId })
};
