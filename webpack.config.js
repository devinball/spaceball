const configBuilder = require("./config/webpack.config");

const entries = {
  spaceball: './handler.js'
}

module.exports = configBuilder(entries, __dirname);