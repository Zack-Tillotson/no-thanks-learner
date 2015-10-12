function getCurrentPlayer(gameState) {
  return gameState.players.list[gameState.players.currentPlayer];
}

function cardGetsCovered(gameState) {
  return !!(getCurrentPlayer(gameState).cards.find((item) => item === gameState.deck[0] - 1));
}

function currentCardValue(gameState) {
  return -1 * gameState.table.pot + (cardGetsCovered(gameState) ? 0 : gameState.deck[0]);  
}

export default {
  build(config) {
    const threshold = config.threshold || 12;
    return {
      predict(gameState, legalActions) {
        const ret = [];
        const cardValue = currentCardValue(gameState);
        legalActions.forEach((action) => {
          switch(action) {
            case 'take':
              ret.push({action, value: 1});
              break;
            case 'noThanks':
              ret.push({action, value: cardValue > threshold ? 2 : 0});
              break;
          }
        });

        return ret;
      }
    }
  }
}