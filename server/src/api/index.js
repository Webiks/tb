const express = require('express');
const router = express.Router();
const dbWorlds = require('./databaseCrud/dbWorlds');
const dbLayers = require('./databaseCrud/dbLayers');
const gsUpload = require('./geoserverCrud/gsUpload');

router.use('/dbworlds', dbWorlds);
router.use('/dblayers', dbLayers);
router.use('/upload', gsUpload);

module.exports = router;
