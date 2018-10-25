const express = require('express');
const router = express.Router();
const utils = require('./utils');

router.use(utils.getFormidable());
router.post('/:workspaceName', utils.uploadFiles);

module.exports = router;
