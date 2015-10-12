var webpack = require("webpack");
var config = require('../webpack.config.js');

webpack(config).run(function(err, stats) {
  console.log("Compiled lib.js");
  var Learner = require('../dist/lib.js');
  Learner.learn();
});