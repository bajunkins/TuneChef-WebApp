import 'idempotent-babel-polyfill';

import express from 'express';
import path from 'path';
// import http from 'http';
import cors from 'cors';
import compression from 'compression';
import sslRedirect from 'heroku-ssl-redirect';

import logger from './logger';
import PartyController from './controllers/partyController';

require('./config/database.js');

const port = process.env.PORT || 3000;

const app = express();

app.use(sslRedirect());
app.use(compression());
app.use(express.static('dist'));
app.use(cors());

// const httpServer = http.createServer(app);
// const io = socketIO(httpServer);

app.use('/api/party', PartyController);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, (err) => {
  if (err) {
    return logger.error(err.message);
  }

  return logger.appStarted(port);
});
