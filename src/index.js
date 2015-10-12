import GameRunner from 'no-thanks-runner';
import predictors from './predictors';

const runnerConfig = {
  reportEveryTurn: false, 
  reportAfter: false
};

function learningRule(weights, reinforcementSignal, predictions, chosen, gameState) {
  const newWeights = [];
  
  const choiceResult = predictions.reduce((sum, prediction) => {
    return (prediction.action == chosen ? prediction.value : 0);
  }, 0);

  weights.forEach((feature, index) => {
    newWeights[index] = feature + choiceResult * reinforcementSignal;
    // console.log("\t", index, ": ", newWeights[index], ' = ', feature, '+', choiceResult, '*', reinforcementSignal);
  });
  // console.log('Learning Rule! => From', weights, 'To', newWeights);
  return newWeights;
}

function chooseRandomPlayers(learner) {
  const numPlayers = parseInt(Math.random() * 3) + 2;
  const players = [learner];
  for(let i = 1; i < numPlayers ; i++) {
    players.push(predictors.random.build({bias: 0, static: true}));
  }
  return players;
}

function shouldContinue(gameCount) {
  return gameCount < 100;
}

function learn() {

  const config = {
    bias: Math.random(),
    static: false
  };

  // const learner = predictors.reinforcement.build(config, learningRule);
  const learner = predictors.random.build(config, learningRule);

  let gameCount = 0;
  while(shouldContinue(gameCount++)) {
    const players = chooseRandomPlayers(learner);
    const gameResult = GameRunner.play(players, runnerConfig);
    console.log('after game', gameCount, config);
  }

  console.log('======\n\n', config);

}

export default {learn};