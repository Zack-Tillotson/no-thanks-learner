
function normalizePredictedValues(actions) {
  const sum = actions.reduce((sum, action) => sum + action.value);
  actions.forEach((action) => action.value /= sum);
}

/* Features

 1. Cards left in deck
 2. Pot size
 3. Current player money
 4. Current player score
 5. Current player card net value
 6. 1st competitor money
 7. 1st competitor score
 8. 1st competitor card net value
 9. 2nd competitor money
 ...

 */

function calculateFeatures(gameState) {
  const features = [];

  // Cards left in deck
  features.push(gameState.deck.length);

  // Pot size
  features.push(gameState.table.pot);

  // Players sorted by current player, score asc
  const currentPlayer = gameState.players.list[gameState.players.currentPlayer];
  const otherPlayers = [
    ...gameState.players.slice(0, gameState.players.currentPlayer),
    ...gameState.players.slice(gameState.players.currentPlayer + 1, gameState.players.list.length)
  ].sort((a,b) => b.score - a.score);

  // Money, card net value for each player
  [currentPlayer, ...otherPlayers].forEach((player) => {
    features.push(player.money);
    features.push(player.score);
    features.push(cardNetValue(gameState.deck[0], player.cards, gameState.table.pot));
  });

  return features;

}

function cardNetValue(card, cards, pot) {
  const withoutCardValue = sumCardsValue([...cards]);
  const withCardValue = sumCardsValue([card, ...cards]);
  return -1 * pot + (withCardValue - withoutCardValue);
}

function sumCardsValue(cards) {
  return cards
    .sort((a,b) => b-a)
    .reduce((sum, card, index) => sum + cards[index - 1] === card - 1 ? 0 : card);
}

function sumFeatureWeights(features, weights) {
  return features.reduce((sum, feature, index) => sum + feature * weights[index], 0);
}

export default {
  build(weights, learningRule) {
    return {
      predict(gameState, legalActions) {
        const ret = [];
        const value = sumFeatureWeights(calculateFeatures(gameState), weights);
        legalActions.forEach((action) => {
          switch(action) {
            case 'take':
              ret.push({action, value: 1});
              break;
            case 'noThanks':
              ret.push({action, value});
              break;
          }
        });
        normalizeValues(ret);
        console.log('rein prediction', ret);
        return ret;
      },
      update(predictions, gameState, newGameState) {
        if(learningRule) {
          learningRule(weights, chosen, prediction);
        }
      }
    }
  }
}