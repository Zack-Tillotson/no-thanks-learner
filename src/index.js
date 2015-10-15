  import GameRunner from 'no-thanks-runner';
import predictors from './predictors';

const runnerConfig = {
  reportEveryTurn: false, 
  reportAfter: true
};

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

  const learner = predictors.reinforcement.build();

  let gameCount = 0;
  while(shouldContinue(gameCount++)) {
    const players = chooseRandomPlayers(learner);
    const gameResult = GameRunner.play(players, runnerConfig);
    console.log(gameResult);
  }

}

export default {learn};