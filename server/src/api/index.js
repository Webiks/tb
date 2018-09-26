const express = require('express');
const router = express.Router();
const dbWorlds = require('./databaseCrud/dbWorlds');
const dbLayers = require('./databaseCrud/dbLayers');
const gsUpload = require('./geoserverCrud/gsUpload');
const fileSystem = require('./fs/fileSystem');
const ansyn = require('./ansyn/ansynService');


router.use('/dbworlds', dbWorlds);
router.use('/dblayers', dbLayers);
router.use('/upload', gsUpload);
router.use('/fs', fileSystem);
router.use('/ansyn', ansyn);

module.exports = router;
