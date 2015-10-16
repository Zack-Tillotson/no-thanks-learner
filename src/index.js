import GameRunner from 'no-thanks-runner';
import predictors from './predictors';

function chooseRandomPlayers(learner) {
  const numPlayers = 4;//parseInt(Math.random() * 3) + 2;
  const players = [learner];
  for(let i = 1; i < numPlayers ; i++) {
    //players.push(predictors.random.build({bias: .33, static: true, id: 'Random ' + i}));
    players.push(predictors.netvalue.build({threshold: 10, static: true, id: 'Net Value ' + i}));
  }
  return players;
}

function niceNumber(num) {
  return parseInt(num*100)/100;
}

function learn() {


  const TRAINING_GAME_COUNT = 1000;
  const EVALUATION_GAME_COUNT = 100;
  const LEARNER_ID = 'Learner';

  const learner = predictors.reinforcement.build({id: LEARNER_ID});
  //const learner = predictors.random.build({bias: 0, static: true, id: LEARNER_ID});
  //const learner = predictors.netvalue.build({threshold: 10, static: true, id: LEARNER_ID});

  console.log('Training stage: ' + TRAINING_GAME_COUNT + ' games');

  let gameCount = 0;
  while(gameCount < TRAINING_GAME_COUNT) {
    
    const players = chooseRandomPlayers(learner);
    GameRunner.play(players, {
      reportEveryTurn: false, 
      reportAfter: false
    });

    gameCount++;
  }

  console.log('Training stage complete\n');
  console.log('Evaluation stage: ' + EVALUATION_GAME_COUNT + ' games');

  learner.config.verbose = false;

  gameCount = 0;
  let gamesWon = 0, avgPos = 0, gameResult;
  while(gameCount < EVALUATION_GAME_COUNT) {
    
    const players = chooseRandomPlayers(learner);
    gameResult = GameRunner.play(players, {
      reportEveryTurn: false, 
      reportAfter: false
    });

    gameResult.players.list.sort(function(a,b) { return b.score - a.score});
    let position = gameResult.players.list.length;
    gameResult.players.list.forEach((player, index) => {
      if(player.id == LEARNER_ID) position = index;
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