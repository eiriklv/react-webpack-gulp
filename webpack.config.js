'use strict';
var webpack = require('webpack');
var path = require('path');

module.exports = {
  cache: true,
  entry: './static/js/main.js',
  output: {
    path: path.join(__dirname, 'dist/js/'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      // any React files need to have /** @jsx React.DOM */ as the first line in the file
      { test: /\.js$/, loader: 'jsx-loader' }
    ]
  },
  devtool: 'source-map',
  externals: {
    // don't include React in the bundle. Use a CDN for this.
    'react': 'React'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin()
  ]
};
