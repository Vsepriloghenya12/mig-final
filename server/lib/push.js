const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function notifyUser(db, userId, message) {
  const user = db.users.find((u) => u.id === userId);
  if (!user || user.status === 'blocked' || !user.pushTokens?.length) return;
  db.notifications ||= [];
  db.notifications.push({ id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, userId, ...message, createdAt: new Date().toISOString() });
  sendExpo(user.pushTokens, message).catch((e) => console.log('push failed:', e.message));
}

async function sendExpo(tokens, message) {
  if (process.env.PUSH_DISABLED === 'true') return;
  const valid = tokens.filter((t) => /^ExponentPushToken\[|^ExpoPushToken\[/.test(String(t)));
  if (!valid.length || typeof fetch !== 'function') return;
  const payload = valid.map((to) => ({ to, sound: 'default', title: message.title || 'Близз', body: message.body || '', data: message.data || {} }));
  await fetch(EXPO_PUSH_URL, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload.length === 1 ? payload[0] : payload) });
}

function gameName(type) {
  return type === 'cards' ? 'Три карты' : type === 'football' ? 'Футбол' : 'Напёрстки';
}

module.exports = { notifyUser, gameName };
