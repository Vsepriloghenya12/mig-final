const { compact, timeLabel } = require('./utils');

function publicUser(user, viewer) {
  if (!user) return null;
  return {
    id: user.id, name: user.name, handle: user.handle, bio: user.bio || '', avatarUrl: user.avatarUrl || '',
    followers: user.followers?.length || 0, following: user.following?.length || 0,
    followersLabel: compact(user.followers?.length || 0),
    isFollowing: viewer ? viewer.following?.includes(user.id) : false
  };
}
function shape(db, viewerId) {
  const viewer = db.users.find((u) => u.id === viewerId) || db.users[0];
  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const activeStories = db.stories.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 86400000);
  return {
    currentUser: { ...publicUser(viewer, viewer), postsCount: db.posts.filter((p) => p.authorId === viewer.id).length },
    users: db.users.filter((u) => u.id !== viewer.id).map((u) => publicUser(u, viewer)),
    posts: db.posts.slice().sort(newer).map((p) => postShape(p, viewer, usersById)),
    stories: activeStories.slice().sort(newer).map((s) => ({ ...s, author: publicUser(usersById.get(s.authorId) || viewer, viewer) })),
    videos: db.videos.slice().sort(newer).map((v) => videoShape(v, viewer, usersById)),
    places: db.places.slice().sort((a, b) => Number(b.checkins || 0) - Number(a.checkins || 0)),
    collections: db.collections.filter((c) => c.userId === viewer.id)
  };
}
function newer(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }
function commentsShape(comments, usersById) { return comments.map((c) => ({ ...c, authorName: usersById.get(c.userId)?.handle || '@user' })); }
function postShape(post, viewer, usersById) {
  const author = usersById.get(post.authorId) || viewer;
  return { ...post, author: publicUser(author, viewer), timeLabel: timeLabel(post.createdAt), likes: post.likedBy.length, liked: post.likedBy.includes(viewer.id), saved: viewer.savedPostIds.includes(post.id), commentsCount: post.comments.length, comments: commentsShape(post.comments, usersById) };
}
function videoShape(video, viewer, usersById) {
  const author = usersById.get(video.authorId) || viewer;
  return { ...video, author: publicUser(author, viewer), likes: video.likedBy.length, liked: video.likedBy.includes(viewer.id), commentsCount: video.comments.length, comments: commentsShape(video.comments, usersById) };
}
module.exports = { shape, publicUser };
