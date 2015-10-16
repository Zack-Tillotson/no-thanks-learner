import GameRunner from 'no-thanks-runner';
import predictors from './predictors';

function chooseRandomPlayers(learner) {
  const numPlayers = 4;//parseInt(Math.random() * 3) + 2;
  const players = [learner];
  for(let i = 1; i < numPlayers ; i++) {
    players.push(predictors.random.build({bias: 0, static: true, id: 'Random ' + i}));
    //players.push(predictors.netvalue.build({threshold: 10, static: true, id: 'Net Value ' + i}));
  }
  return players;
}

function learn() {


  const TRAINING_GAME_COUNT = 10000;
  const EVALUATION_GAME_COUNT = 1000;
  const LEARNER_ID = 'Learner';

  const learner = predictors.reinforcement.build({id: LEARNER_ID});
  //const learner = predictors.random.build({bias: 0, static: true, id: LEARNER_ID});
  //const learner = predictors.netvalue.build({threshold: 10, static: true, id: LEARNER_ID});

  console.log('Training stage: ' + TRAINING_GAME_COUNT + ' games');

  let gameCount = 0, gamesWon = 0, gameResult;
  while(gameCount < TRAINING_GAME_COUNT) {
    
    const players = chooseRandomPlayers(learner);
    gameResult = GameRunner.play(players, {
      reportEveryTurn: false, 
      reportAfter: false
    });

    gameResult.players.list.sort(function(a,b) { return b.score - a.score});
    
    gameCount++;
    if(gameResult.players.list[0].id == LEARNER_ID) gamesWon++;
    
  }

  console.log('Training stage complete\n');
  console.log('Evaluation stage: ' + EVALUATION_GAME_COUNT + ' games');

  learner.config.verbose = false;

  gameCount = 0, gamesWon = 0;
  while(gameCount < EVALUATION_GAME_COUNT) {
    
    const players = chooseRandomPlayers(learner);
    gameResult = GameRunner.play(players, {
      reportEveryTurn: false, 
      reportAfter: false
    });

    gameResult.players.list.sort(function(a,b) { return b.score - a.score});
    
    gameCount++;
    if(gameResult.players.list[0].id == LEARNER_ID) gamesWon++;
    
  }

  console.log(
    "\nEvaluation stage complete", 
    parseInt(gamesWon/(gameCount%90000)*10000)/100 + '% - ' + gamesWon + " / " + gameCount%90000,
    "\n"
  );
  console.log( JSON.stringify(gameResult.players));

}

export default {learn};