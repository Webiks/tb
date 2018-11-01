const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const uploadUtils = require('./uploadUtils');

const uploadPath = uploadUtils.getUploadPath();
const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:worldId', uploadUtils.uploadFiles);

module.exports = router;
