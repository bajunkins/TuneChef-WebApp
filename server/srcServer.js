import '@babel/polyfill';

import express from 'express';
import path from 'path';
import webpack from 'webpack';
// import http from 'http';
import cors from 'cors';
import sslRedirect from 'heroku-ssl-redirect';

import config from '../webpack.config.dev';
import logger from './logger';
import PartyController from './controllers/partyController';
import SpotifyController from './controllers/spotifyController';

require('dotenv').config();
require('./config/devDatabase.js');

const port = process.env.PORT || 3000;

const app = express();

app.use(sslRedirect());
app.use(cors());

const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: 'errors-only',
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use('/api/party', PartyController);
app.use('/api/spotify', SpotifyController);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../app/index.html'));
});

app.listen(port, (err) => {
  if (err) {
    return logger.error(err.message);
  }

  return logger.appStarted(port);
});
