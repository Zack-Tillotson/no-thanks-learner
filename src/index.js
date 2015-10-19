import GameRunner from 'no-thanks-runner';
import predictors from './predictors';

function chooseRandomPlayers(learner) {
  const numPlayers = 4;//parseInt(Math.random() * 3) + 2;
  const players = [learner];
  for(let i = 1; i < numPlayers ; i++) {
    if(Math.random() > .5) {
      players.push(predictors.random.build({bias: .25, static: true, id: 'Random ' + i}));
    } else {
      players.push(predictors.netvalue.build({threshold: 10, static: true, id: 'Net Value ' + i}));
    }
  }
  return players;
}

function niceNumber(num) {
  return parseInt(num*100)/100;
}

function learn() {

  const generalConfig = {
    id: 'Learner'
  }

  const trainingConfig = {
    gameCount: 100000,
    reportEveryTurn: false,
    reportAfter: false
  };

  const evaluationConfig = {
    gameCount: 1000,
    reportEveryTurn: false,
    reportAfter: true
  };

  const learner = predictors.reinforcement.build({id: generalConfig.id});
  //const learner = predictors.random.build({bias: 0, static: true, id: generalConfig.id});
  //const learner = predictors.netvalue.build({threshold: 10, static: true, id: generalConfig.id});

  console.log('Training stage: ' + trainingConfig.gameCount + ' games');

  let gameCount = 0;
  while(gameCount < trainingConfig.gameCount) {
    
    const players = chooseRandomPlayers(learner);
    GameRunner.play(players, trainingConfig);

    gameCount++;

    if(gameCount % 1000 === 0) {
      console.log(100*niceNumber(gameCount/trainingConfig.gameCount) + '%');
    } 

  }

  console.log('Training stage complete\n');
  console.log('Evaluation stage: ' + evaluationConfig.gameCount + ' games');

  learner.config.verbose = false;

  gameCount = 0;
  let gamesWon = 0, avgPos = 0, gameResult;
  while(gameCount < evaluationConfig.gameCount) {
    
    const players = chooseRandomPlayers(learner);
    gameResult = GameRunner.play(players, evaluationConfig);

    gameResult.players.list.sort(function(a,b) { return a.score - b.score});
    let position = gameResult.players.list.length;
    gameResult.players.list.forEach((player, index) => {
      if(player.id == generalConfig.id) position = index;
    });
    
    gameCount++;
    avgPos += position + 1;
    if(position == 0) gamesWon++;
    
  }

  console.log(
    "\nEvaluation stage complete", 
    '\nWon:', 100*niceNumber(gamesWon/gameCount) + '% - ' + gamesWon + " / " + gameCount,
    '\nAvg Rank:', niceNumber(avgPos/gameCount),
    "\n"
  );
  console.log( JSON.stringify(gameResult.players));

}

export default {learn};