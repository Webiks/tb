const express = require('express');
const router = express.Router();
const worlds = require('./worlds');
const layers = require('./layers');
// const uploadFiles = require('./uploadFiles');
const uploadLayers = require('./uploadLayers');

router.use('/worlds', worlds);
router.use('/layers', layers);
// router.use('/upload', uploadFiles);
router.use('/upload', uploadLayers);

module.exports = router;
