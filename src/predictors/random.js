function sortByValue(a,b) {
  return b.value - a.value;
}

export default {
  build(config, learningRule) {
    const takeOdds = config.bias || 0;
    return {
      id: config.id,
      config,
      predict(gameState, actions) {
        const ret = [];
        for(var i = 0 ; i < actions.length ; i++) {
          var action = actions[i];
          switch(action) {
            case 'take':
              ret.push({action: action, value: .5});
              break;
            case 'noThanks':
              ret.push({action: action, value: Math.random() < takeOdds ? 0 : 1});
              break;
          }
        };

        ret.sort(sortByValue);

        return ret;
      },

      update(predictions, chosen, gameState) {
        if(!config.static) {
          config.bias = config.bias + .01 * Math.random() - .005;
        }
      }
    }
  }
}