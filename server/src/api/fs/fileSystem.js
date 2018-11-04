const express = require('express');
const router = express.Router();
require('../fs/fileMethods')();

router.post('/', (req, res) => {
	console.log('start the file System: remove file...' + JSON.stringify(req.body));
	return removeFile(req.body.filePath);
});

module.exports = router;
