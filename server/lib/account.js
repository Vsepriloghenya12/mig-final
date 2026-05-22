const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('./db');

function deleteAccountData(db, userId) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { deleted: false };
  const postIds = new Set(db.posts.filter((p) => p.authorId === userId).map((p) => p.id));
  const videoIds = new Set(db.videos.filter((v) => v.authorId === userId).map((v) => v.id));
  const storyIds = new Set(db.stories.filter((s) => s.authorId === userId).map((s) => s.id));
  const dialogIds = new Set(db.dialogs.filter((d) => d.participantIds.includes(userId)).map((d) => d.id));
  const media = collectUserMedia(db, userId, user, dialogIds);
  db.users = db.users.filter((u) => u.id !== userId);
  db.users.forEach((u) => cleanUserRefs(u, userId, postIds));
  db.posts = db.posts.filter((p) => !postIds.has(p.id)).map((p) => cleanContentRefs(p, userId));
  db.videos = db.videos.filter((v) => !videoIds.has(v.id)).map((v) => cleanContentRefs(v, userId));
  db.stories = db.stories.filter((s) => !storyIds.has(s.id));
  db.places = db.places.filter((p) => p.ownerId !== userId && p.userId !== userId);
  db.collections = db.collections.filter((c) => c.userId !== userId);
  db.dialogs = db.dialogs.filter((d) => !dialogIds.has(d.id));
  db.messages = db.messages.filter((m) => !dialogIds.has(m.dialogId) && m.userId !== userId);
  db.games = db.games.filter((g) => !dialogIds.has(g.dialogId) && g.creatorId !== userId && g.opponentId !== userId);
  db.reports = db.reports.filter((r) => r.reporterId !== userId && r.targetUserId !== userId && !postIds.has(r.targetId) && !videoIds.has(r.targetId) && !storyIds.has(r.targetId));
  db.moderationActions.push({ type: 'account_delete', userId, createdAt: new Date().toISOString() });
  media.forEach(deleteUploadFile);
  return { deleted: true, mediaDeleted: media.length };
}
function cleanUserRefs(u, userId, postIds) {
  removeValue(u.followers, userId); removeValue(u.following, userId); removeValue(u.blockedUserIds, userId);
  if (Array.isArray(u.savedPostIds)) u.savedPostIds = u.savedPostIds.filter((id) => !postIds.has(id));
}
function cleanContentRefs(item, userId) {
  item.comments = (item.comments || []).filter((c) => c.userId !== userId);
  item.likedBy = (item.likedBy || []).filter((id) => id !== userId);
  return item;
}
function collectUserMedia(db, userId, user, dialogIds) {
  const items = [user, ...db.posts.filter((x) => x.authorId === userId), ...db.videos.filter((x) => x.authorId === userId), ...db.stories.filter((x) => x.authorId === userId), ...db.messages.filter((m) => dialogIds.has(m.dialogId) || m.userId === userId)];
  return [...new Set(items.flatMap((x) => [x.avatarUrl, x.imageUrl, x.videoUrl, x.mediaUrl]).filter(Boolean))];
}
function deleteUploadFile(url) {
  const name = path.basename(String(url).split('?')[0]);
  if (!name || name.includes('..')) return;
  const file = path.join(UPLOAD_DIR, name);
  try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch {}
}
function removeValue(list, value) { if (!Array.isArray(list)) return; let i; while ((i = list.indexOf(value)) >= 0) list.splice(i, 1); }
module.exports = { deleteAccountData };
