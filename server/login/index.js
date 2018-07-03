const config = require('../config/configJson');
const express = require('express');
const checkAuth = require('./check-auth');
const router = express.Router();

router.post('/checkAuth', checkAuth, (req, res) => {
    res.send('o.k');
});

function isEqual(str1, srt2) {
  return str1.trim().toLowerCase() === srt2.trim().toLowerCase();
}

router.post('/login', (req, res) => {
  const correctUsername = isEqual(req.body.username, process.env[config.login.usernameKey]);
  const correctPassword = isEqual(req.body.password, process.env[config.login.passwordKey]);
  const isAuthenticated = correctUsername && correctPassword;
  req.session.authenticated = isAuthenticated;
  if (isAuthenticated) {
    res.send('o.k');
  } else {
    res.status(401).send('unAuthorized')
  }
});

router.post('/logout', (req, res, next) => {
    req.session.authenticated = false;
    res.send('o.k');
});

module.exports = router;
