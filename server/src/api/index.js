const express = require('express');
const router = express.Router();
const dbWorlds = require('./databaseCrud/dbWorlds');
const dbLayers = require('./databaseCrud/dbLayers');
const worlds = require('./geoserverCrud/GsWorlds');
const layers = require('./geoserverCrud/GsLayers');
const uploadFiles = require('./geoserverCrud/UploadFilesToGS');

router.use('/dbworlds', dbWorlds);
router.use('/dblayers', dbLayers);
router.use('/worlds', worlds);
router.use('/layers', layers);
router.use('/upload', uploadFiles);

module.exports = router;
