
function normalizePredictedValues(actions) {
  const sum = actions.reduce((sum, action) => (sum + action.value), 0);
  actions.forEach((action) => action.value /= sum);
}

export default {
  build(config, learningRule) {
    const takeOdds = config.bias || 0;
    return {
      id: config.id,
      config,
      predict(gameState, options) {
        options.forEach((option) => {
          switch(option.action) {
            case 'take':
              option.value = 1;
              break;
            case 'noThanks':
              option.value = Math.random() * takeOdds * 2;
              break;
          }
        });

        normalizePredictedValues(options);

        return options;
      },

      update(predictions, chosen, gameState) {
        if(!config.static) {
          config.bias = config.bias + .01 * Math.random() - .005;
        }
      }
    }
  }
}