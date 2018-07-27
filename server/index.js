const express = require('express');
const cors = require('cors');
const http = require ('http');
const api = require('./src/api/index');
const login = require('./src/login/index');
const bodyParser = require('body-parser');
const session = require('express-session');
const checkAuth = require('./src/login/check-auth');
const DBManager = require('./src/database/DBManager');

const app = express();
const server = http.createServer(app);

require('./src/config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());

// DB Connection URL
const url = `${configUrl.mongoBaseUrl}/${configParams.dbName}`;

// start the connection to the mongo Database
DBManager.connect(url);

// define the session
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

// start the App server
server.listen(configParams.serverPort, () => console.log('listen to ', configParams.serverPort));

// stop the App server
function stop() {
    server.close();
}

module.exports = {
    stop,
    server: server,
    app: app
};