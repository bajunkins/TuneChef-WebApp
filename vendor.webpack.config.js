const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: process.cwd(),
  mode: 'none',
  entry: {
    vendor: [
      'async',
      'axios',
      'body-parser',
      'chalk',
      'classnames',
      'compression',
      'cors',
      'heroku-ssl-redirect',
      'history',
      'mongoose',
      'path',
      'prop-types',
      'react',
      'react-device-detect',
      'react-dom',
      'react-helmet',
      'react-router-dom',
    ],
  },
  output: {
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dist'),
    library: '[name]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dist', '[name]-manifest.json'),
      name: '[name]',
    }),
  ],
};
