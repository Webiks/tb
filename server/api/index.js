const express = require('express');
const router = express.Router();
const worlds = require('./worlds');
const layers = require('./layers');
const uploadFiles = require('./uploadFiles');

router.use('/worlds', worlds);
router.use('/layers', layers);
router.use('/upload', uploadFiles);

module.exports = router;
