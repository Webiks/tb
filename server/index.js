const express = require('express');
const cors = require('cors');
const api = require('./api');
const login = require('./login');
const bodyParser = require('body-parser');
const session = require('express-session');
const checkAuth = require('./login/check-auth');

const app = express();

require('./config/serverConfig')();
const configParams = config().configParams;

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
app.use('/login', login);
// app.use('/api', checkAuth);
app.use('/api', api);

app.listen(configParams.serverPort, () => console.log('listen to ', configParams.serverPort));
