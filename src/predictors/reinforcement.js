  // Features describing the current game state, each feature's value is either 0 or 1.
function calculateFeatures(id, gameState) {
  const features = [1];

  // Pot size greater than x
  [7, 15].forEach((potSize) => {
    features.push(gameState.table.pot > potSize ? 1 : 0);
  });

  // Players sorted by current player, score asc
  const players = gameState.players.list
    .slice(0)
    .sort((a,b) => {
      if(a.id === id) {
        return -1;
      } else if(b.id === id) {
        return 1;
      } else {
        return b.score - a.score;
      }
    });

  // // Money, card net value for each player
  players.forEach((player) => {
    [8, 15].forEach((netValue) => {
      const playerNetValue = cardNetValue(gameState.deck[0], player.cards, gameState.table.pot);
      features.push(playerNetValue > netValue ? 1 : 0);
    });
    [3, 7].forEach((money) => {
      features.push(player.money > money ? 1 : 0);
    });
  });

  return features;

}

// Weights start at random [-1, 1]
function ensureWeights(weights, featureCount) {
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

// Sigmoid smoothing
function kernel(value) {
  const ret = 1/(1+Math.pow(Math.E, -1 * value));
  return ret;
}

function updateWeights(weights, features, choiceScalar, reinforcementSignal) {
  weights.forEach((weight, index) => { 
    if(index > 0) {
      const newWeight = (weight + features[index] * choiceScalar * reinforcementSignal) * .98;
      weights[index] = newWeight;
    }
  });
}

function calculateReinforcementSignal(id, gameState) {
  
  const usScore = gameState.players.list.find((player) => player.id == id).score;
  const bestOtherScore = gameState.players.list.reduce((best, player) => 
    player.id != id && player.score < best ? player.score : best
  , 999);
  
  const multipler = gameState.game.state === 'gameover' 
    ? (usScore < bestOtherScore ? .001 : 10000) 
    : .01;

  const rs = multipler * usScore;

  return rs;
}

function sortByValue(a,b) {
  return b.value - a.value;
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

      id: config.id || 'Reinforcement Player!',

      config,

      weights: [.1], // Constant initial weight

      predict(gameState, actions) {
        const ret = [];
        const features = calculateFeatures(this.id, gameState);
        const sumFW = sumFeatureWeights(features, ensureWeights(this.weights, features.length));
        const value = kernel(sumFW);

        actions.forEach((action) => {
          switch(action) {
            case 'take':
              ret.push({action, value});
              break;
            case 'noThanks':
              ret.push({action, value: .5});
              break;
          }
        });

        ret.sort(sortByValue);

        if(config.verbose) {
          console.log('Predict()', sumFW, value, JSON.stringify(ret));
        }

        return ret;
      },

      update(predictions, chosen, gameState, nextGameState) {

        const chosenPrediction = predictions.find((prediction) => prediction.action === chosen);

        const weights = this.weights;
        const features = calculateFeatures(this.id, gameState);

        const choiceScalar = (chosenPrediction.action === 'take' ? -1 : 1) * chosenPrediction.value;
        const nextReinforcementSignal = calculateReinforcementSignal(this.id, nextGameState);

        if(config.verbose) {
          console.log('Update()', choiceScalar, nextReinforcementSignal);
        }

        updateWeights(weights, features, choiceScalar, nextReinforcementSignal);

      },

      toString() {
        return this.id, this.weights;
      }
    }
  }
}
