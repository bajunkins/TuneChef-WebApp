const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

import PartyController from './controllers/partyController';


app.use(express.static(path.join(__dirname, 'build')));

app.use('/api/party', PartyController);

app.listen(process.env.PORT || 8080);