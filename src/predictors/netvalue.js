import 'array.prototype.find';

function getCurrentPlayer(gameState) {
  return gameState.players.list[gameState.players.currentPlayer];
}

function cardGetsCovered(gameState) {
  return (getCurrentPlayer(gameState).cards.find((item) => item === gameState.deck[0] - 1)) > -1;
}

function currentCardValue(gameState) {
  return -1 * gameState.table.pot + (cardGetsCovered(gameState) ? 0 : gameState.deck[0]);  
}

function normalizePredictedValues(actions) {
  const sum = actions.reduce((sum, action) => (sum + action.value), 0);
  actions.forEach((action) => action.value /= sum);
}

export default {
  build(config = {}) {
    const threshold = config.threshold || 10;
    return {
      id: config.id || 'Net Value ' + threshold,
      config,
      predict(gameState, options) {
        const ret = [];
        const cardValue = currentCardValue(gameState);
        options.forEach((option) => {
          switch(option.action) {
            case 'take':
              option.value = 1;
              break;
            case 'noThanks':
              option.value = cardValue < threshold ? 2 : 0;
              break;
          }
        });

        normalizePredictedValues(options);

        return options;
      },

      update(predictions, chosen, gameState) {
      }
    }
  }
}