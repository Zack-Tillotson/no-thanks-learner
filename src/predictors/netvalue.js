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

function sortByValue(a,b) {
  return b.value - a.value;
}

export default {
  build(config = {}) {
    const threshold = config.threshold || 10;
    return {
      id: config.id || 'Net Value ' + threshold,
      config,
      predict(gameState, actions) {
        const ret = [];
        const cardValue = currentCardValue(gameState);
        actions.forEach((action) => {
          switch(action) {
            case 'take':
              ret.push({action, value: 1});
              break;
            case 'noThanks':
              ret.push({action, value: cardValue > threshold ? 2 : 0});
              break;
          }
        });

        ret.sort(sortByValue);

        return ret;
      },

      update(predictions, chosen, gameState) {
      }
    }
  }
}