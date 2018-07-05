const express = require('express');
const cors = require('cors');
const api = require('./api');
const login = require('./login');
const bodyParser = require('body-parser');
const session = require('express-session');
const checkAuth = require('./login/check-auth');

const { serverPort } = require('./config/configJson');

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
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

app.listen(serverPort, () => console.log('listen to ', serverPort));
