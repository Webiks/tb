const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const utils = require('./uploadUtils');

const uploadPath = utils.getUploadPath();
const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:workspaceName', utils.uploadFiles);

module.exports = router;
