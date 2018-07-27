const express = require('express');
const cors = require('cors');
const api = require('./api/index');
const login = require('./login');
const bodyParser = require('body-parser');
const session = require('express-session');
const checkAuth = require('./login/check-auth');
const DBManager = require('./database/DBManager');
require("babel-register")({
    ignore: false
});

const app = express();
const server = http.createServer(app);

require('./config/serverConfig')();
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