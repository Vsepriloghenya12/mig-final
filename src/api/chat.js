export const chatApi = {
  dialogs: (api) => api.get('/api/dialogs'),
  openDialog: (api, targetId) => api.post('/api/dialogs', { targetId }),
  messages: (api, dialogId) => api.get(`/api/dialogs/${dialogId}/messages`),
  sendText: (api, dialogId, text) => api.post(`/api/dialogs/${dialogId}/messages`, { type: 'text', text }),
  sendMedia: (api, dialogId, media) => api.post(`/api/dialogs/${dialogId}/messages`, { type: media.mediaType, mediaUrl: media.url }),
  startGame: (api, dialogId, gameType) => api.post(`/api/dialogs/${dialogId}/games`, { gameType }),
  acceptGame: (api, gameId) => api.post(`/api/games/${gameId}/accept`),
  declineGame: (api, gameId) => api.post(`/api/games/${gameId}/decline`),
  moveGame: (api, gameId, choice) => api.post(`/api/games/${gameId}/move`, { choice })
};
