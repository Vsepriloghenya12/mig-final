function result(game) {
  if (game.type === 'football') return game.creatorChoice === game.opponentChoice ? 'save' : 'goal';
  return game.creatorChoice === game.opponentChoice ? 'hit' : 'miss';
}
function assertTurn(game, userId) {
  if (game.status === 'creator_turn' && game.creatorId === userId) return 'creatorChoice';
  if (game.status === 'opponent_turn' && game.opponentId === userId) return 'opponentChoice';
  throw new Error('Сейчас не ваш ход');
}
module.exports = { result, assertTurn };
