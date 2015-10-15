// Features describing the current game state, each feature will have a value [0,1]. 
function calculateFeatures(id, gameState) {
  const features = [];

  // Cards left in deck
  // features.push(gameState.deck.length);

  // Pot size greater than x
  for(let potSize = 0 ; potSize < 30 ; potSize += 3) {
    features.push(gameState.table.pot >= potSize ? 1 : 0);
  }

  // // Players sorted by current player, score asc
  const currentPlayer = gameState.players.list.find((player) => player.id == id);
  const otherPlayers = [];
  // const otherPlayers = gameState.players.list
  //   .filter(...)
  //   .sort((a,b) => b.score - a.score);

  // // Money, card net value for each player
  [currentPlayer, ...otherPlayers].forEach((player) => {
      for(let netValue = 0 ; netValue < 30 ; netValue += 3) {
        features.push(
          cardNetValue(gameState.deck[0], player.cards, gameState.table.pot) >= netValue ? 1 : 0
        );
      }
  });

  return features;

}

// Weights start at random [-1, 1]
function getWeights(weights, featureCount) {
  while(weights.length < featureCount) {
    weights.push(Math.random() * 2 - 1);
  }
  return weights;
}

function sumFeatureWeights(features, weights) {
  const sum = features.reduce((sum, feature, index) => {
    return sum + feature * weights[index];
  }, 0);
  return sum;
}

// Step function
function kernel(value) {
  return Math.floor(value, 1.0000);
}


function updateWeights(weights, features, scaledOdds, reinforcementSignal) {
  // console.log('Updating weights, successMeasure: ' + scaledOdds + ', RS: ' + reinforcementSignal);
  weights.forEach((weight, index) => { 
    // console.log('Feature #' + index + ': ' + features[index] + ' * ' + weight + ' => ' + weight + scaledOdds * reinforcementSignal);
    weights[index] = (weight + features[index] * scaledOdds * reinforcementSignal) * .98;
  });
}

function calculateReinforcementSignal(id, gameState) {
  
  const usScore = gameState.players.list.find((player) => player.id == id).score;
  const bestOtherScore = gameState.players.list.reduce((best, player) => 
    player.id != id && player.score < best ? player.score : best
  , 999);
  
  const multipler = gameState.game.state === 'gameover' 
    ? (usScore < bestOtherScore ? .01 : 100) 
    : 1;

  // console.log('score', usScore, '\n', JSON.stringify(gameState.players.list.find((player) => player.id == id)));

  const rs = multipler * usScore;

  return rs;
}

function normalizePredictedValues(actions) {
  const sum = actions.reduce((sum, action) => sum + action.value, 0);
  actions.forEach((action) => action.value /= sum);
}

function cardNetValue(card, cards, pot) {
  const withoutCardValue = sumCardsValue([...cards]);
  const withCardValue = sumCardsValue([card, ...cards]);
  return -1 * pot + (withCardValue - withoutCardValue);
}

function sumCardsValue(cards) {
  return cards
    .sort((a,b) => b-a)
    .reduce((sum, card, index) => sum + cards[index - 1] === card - 1 ? 0 : card, 0);
}

export default {
  build(config, learningRule) {
    return {

      id: 'Reinforcement Guy!',

      config,

      weights: [],

      predict(gameState, options) {
        const ret = [];
        const features = calculateFeatures(this.id, gameState);
        const value = kernel(sumFeatureWeights(features, getWeights(this.weights, features.length)));

        options.forEach((option) => {
          switch(option.action) {
            case 'take':
              option.value = value;
              break;
            case 'noThanks':
              option.value = .5;
              break;
          }
        });

        normalizePredictedValues(options);

        // console.log('Prediction complete', value, options.map((option) => option.action + ' (' + option.value + ')'));

        return options;
      },

      update(predictions, chosen, gameState, nextGameState) {

        const weights = this.weights;
        const features = calculateFeatures(this.id, gameState);

        const scaledOdds = 1 - predictions.find((prediction) => prediction.action == chosen).value;
        const reinforcementSignal = calculateReinforcementSignal(this.id, gameState);
        const nextReinforcementSignal = calculateReinforcementSignal(this.id, nextGameState);

        updateWeights(weights, features, scaledOdds, nextReinforcementSignal - reinforcementSignal);
      },

      toString() {
        return this.id, this.weights;
      }
    }
  }
}
