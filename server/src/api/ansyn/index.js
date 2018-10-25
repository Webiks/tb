const express = require('express');
const router = express.Router();
const fetchLayers = require('./fetchLayers');
const uploadFiles = require('../upload/uploadFiles');

router.post('/fetchLayers', fetchLayers);
router.use('/uploadImage', uploadFiles);

module.exports = router;
