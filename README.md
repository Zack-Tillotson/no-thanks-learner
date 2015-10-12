No Thanks Predictors
=========

Zack Tillotson

A set of optimizable predictors (aka players) for the game No Thanks!

```
npm install
npm test
```

----------

Strategy for Reinforcement Learner

- LM101 Link
  - http://www.learningmachines101.com/lm101-025-how-to-build-a-lunar-lander-autopilot-learning-machine/
- Strategy
  - 1. Define state vector
  - 2. Create game simulator
    - What are results of actions
    - Who are the opponents
    - Reenforcement signal
      - Special feature => small when doing well and large when doing poorly
      - eg
        - RS = (us - best competitor) / (total score taken + 1) * 50 + 50
        - 0-100 while playing
          - 50 is tied with everyone
          - 100 is losing by most possible
          - 0 is winning by most possible
        - 10x when game over and have lost
        - 1/10x when game over and have won
  - 3. Develop control law
    - Linear combination of features
    - Prob(Action|State) = sum( Feature_n(state) * W(n) )
      - Features
        - Table
          - Pot
          - Card ?
            - Redundant when player card value considered
          - Cards left
        - For each player
          - Your money
          - Your card total
          - Card value to you
  - 4. Develop learning rule
    - Adaptive gradient decent
    - W'(n) = W(n) * (Action - Prob(action)) * Reenforcement signal
