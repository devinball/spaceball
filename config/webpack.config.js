const path = require('path');

module.exports = function(entries, dirName){

  const settings = path.join(__dirname, process.env.NODE_ENV || 'dev') + '.json';

  return {
    entry: entries,
    context : dirName,
    target: 'node',
    module: {
      loaders: [
        {
          test: /.js?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            presets: [
              'es2015',
              'stage-0'
            ],
            plugins: [
              'transform-runtime',          // Externalise references to helpers and builtins, automatically polyfilling your code without polluting globals.
              'transform-class-properties'  // Allows class instance fields and class static properties.
            ]
          }
        },
        { test: /\.json$/, loader: "json-loader" }
      ]
    },
    externals: ["aws-sdk"],
    resolve: {
      extensions: ['', '.js', '.json'],
      modulesDirectories: ['node_modules'],
      alias: {
        settings: settings
      }
    },
    output: {
      libraryTarget: 'commonjs',
      path: '.webpack',
      filename: '[name].js'
    }
  };
}