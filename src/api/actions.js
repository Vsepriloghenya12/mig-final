export const postActions = {
  like: (api, postId) => api.post(`/api/posts/${postId}/like`),
  save: (api, postId) => api.post(`/api/posts/${postId}/save`),
  comment: (api, postId, text) => api.post(`/api/posts/${postId}/comments`, { text }),
  create: (api, payload) => api.post('/api/posts', payload)
};

export const videoActions = {
  like: (api, videoId) => api.post(`/api/videos/${videoId}/like`),
  create: (api, payload) => api.post('/api/videos', payload)
};

export const storyActions = {
  create: (api, payload) => api.post('/api/stories', payload)
};

export const placeActions = {
  create: (api, payload) => api.post('/api/places', payload),
  checkin: (api, placeId) => api.post(`/api/places/${placeId}/checkin`)
};

export const profileActions = {
  update: (api, payload) => api.post('/api/profile', payload),
  follow: (api, targetId) => api.post('/api/follow', { targetId })
};

export const collectionActions = {
  create: (api, payload) => api.post('/api/collections', payload)
};
