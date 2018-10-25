const express = require('express');
const router = express.Router();
const fetchLayers = require('./fetchLayers');
const uploadImage = require('./uploadImage');

router.post('/fetchLayers', fetchLayers);
router.post('/uploadImage', uploadImage);

module.exports = router;
