import PredictorFactory from './predictor';

export default {
  getInitialState() {
    return {noThanksOdds: 0, learningRate: 5}
  },
  getPredictor(state) {
    return PredictorFactory({noThanksOdds: state.noThanksOdds});
  },
  getCompetitorPredictor(state, index, count) {
    return PredictorFactory({noThanksOdds: .5});
  },
  updateState(state, score, prevScore) {
    state.noThanksOdds = state.noThanksOdds + state.learningRate;
    return state;
  },
  shouldStop(state) {
    return state.noThanksOdds > 100;
  },
  getStateDescription(state) {
    return 'Random ' + state.noThanksOdds + '% NT';
  }
}