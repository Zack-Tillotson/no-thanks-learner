var webpack = require("webpack");
var config = require('../webpack.config.js');
var Explorer = require('no-thanks-explorer');

webpack(config).run(function(err, stats) {
  console.log("Compiled lib.js");
  var Controls = require('../dist/lib.js');
  Explorer(Controls.Random);
});