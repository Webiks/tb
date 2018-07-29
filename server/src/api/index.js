const express = require('express');
const router = express.Router();
const dbWorlds = require('./databaseCrud/dbWorlds');
const dbLayers = require('./databaseCrud/dbLayers');
const gsLayers = require('./geoserverCrud/gsLayers');
const gsUpload = require('./geoserverCrud/gsUpload');

router.use('/dbworlds', dbWorlds);
router.use('/dblayers', dbLayers);
router.use('/gsLayers', gsLayers);
router.use('/upload', gsUpload);

module.exports = router;
