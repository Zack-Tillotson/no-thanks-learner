function calculateReinforcementSignal(gameState) {
  return Math.random();
}

function getWeights(config) {
  return [config.bias];
}

function normalizePredictedValues(actions) {
  const sum = actions.reduce((sum, action) => (sum + action.value), 0);
  actions.forEach((action) => action.value /= sum);
}

export default {
  build(config, learningRule) {
    const takeOdds = config.bias || 0;
    return {
      predict(gameState, legalActions) {
        const ret = [];
        legalActions.forEach((action) => {
          switch(action) {
            case 'take':
              ret.push({action, value: 1});
              break;
            case 'noThanks':
              ret.push({action, value: Math.random() / 50 * takeOdds});
              break;
          }
        });

        normalizePredictedValues(ret);

        return ret;
      },

      update(predictions, chosen, gameState) {
        if(!config.static) {
          const reinforcementSignal = calculateReinforcementSignal(gameState);
          const weights = learningRule(getWeights(config), reinforcementSignal, predictions, chosen, gameState);
          config.bias = weights[0];
        }
      }
    }
  }
}