export default function(config) {
  const noThanksOdds = config.noThanksOdds;
  return {
    predict(gameState, legalActions) {
      if(legalActions.length === 1 || Math.random() > noThanksOdds / 100) {
        return 'take';
      } else {
        return 'noThanks';
      }
    }
  }
}