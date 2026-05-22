const { compact, timeLabel } = require('./utils');

function publicUser(user, viewer) {
  if (!user) return null;
  return { id: user.id, name: user.name, handle: user.handle, bio: user.bio || '', avatarUrl: user.avatarUrl || '', status: user.status || 'active', followers: user.followers?.length || 0, following: user.following?.length || 0, followersLabel: compact(user.followers?.length || 0), isFollowing: viewer ? viewer.following?.includes(user.id) : false, isBlocked: viewer ? viewer.blockedUserIds?.includes(user.id) : false };
}
function shape(db, viewerId) {
  const viewer = db.users.find((u) => u.id === viewerId) || db.users[0];
  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const hidden = hiddenUserSet(viewer, db.users);
  const activeStories = db.stories.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 86400000);
  return {
    currentUser: { ...publicUser(viewer, viewer), postsCount: db.posts.filter((p) => p.authorId === viewer.id && p.status !== 'deleted').length },
    users: db.users.filter((u) => u.id !== viewer.id && !hidden.has(u.id)).map((u) => publicUser(u, viewer)),
    posts: db.posts.filter((p) => visibleContent(p, hidden)).sort(newer).map((p) => postShape(p, viewer, usersById, hidden)),
    stories: activeStories.filter((s) => visibleContent(s, hidden)).sort(newer).map((s) => ({ ...s, author: publicUser(usersById.get(s.authorId) || viewer, viewer) })),
    videos: db.videos.filter((v) => visibleContent(v, hidden)).sort(newer).map((v) => videoShape(v, viewer, usersById, hidden)),
    places: db.places.filter((p) => p.status !== 'deleted').sort((a, b) => Number(b.checkins || 0) - Number(a.checkins || 0)),
    collections: db.collections.filter((c) => c.userId === viewer.id)
  };
}
function hiddenUserSet(viewer, users) { const set = new Set(viewer?.blockedUserIds || []); users.filter((u) => u.status && u.status !== 'active').forEach((u) => set.add(u.id)); return set; }
function visibleContent(item, hidden) { return item.status !== 'deleted' && !hidden.has(item.authorId) && !hidden.has(item.userId); }
function newer(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }
function commentsShape(comments, usersById, hidden) { return (comments || []).filter((c) => !hidden.has(c.userId)).map((c) => ({ ...c, authorName: usersById.get(c.userId)?.handle || '@user' })); }
function postShape(post, viewer, usersById, hidden) { const author = usersById.get(post.authorId) || viewer; const comments = commentsShape(post.comments, usersById, hidden); return { ...post, author: publicUser(author, viewer), timeLabel: timeLabel(post.createdAt), likes: post.likedBy.length, liked: post.likedBy.includes(viewer.id), saved: viewer.savedPostIds.includes(post.id), commentsCount: comments.length, comments }; }
function videoShape(video, viewer, usersById, hidden) { const author = usersById.get(video.authorId) || viewer; const comments = commentsShape(video.comments, usersById, hidden); return { ...video, author: publicUser(author, viewer), likes: video.likedBy.length, liked: video.likedBy.includes(viewer.id), commentsCount: comments.length, comments }; }
module.exports = { shape, publicUser, hiddenUserSet };
