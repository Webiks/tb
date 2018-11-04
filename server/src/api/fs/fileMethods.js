const fs = require('fs-extra');
const path = require('path');

require('../../config/serverConfig')();
const configParams = config().configParams;

module.exports = function () {
	this.setOptions = (uploadDir) => {
		return {
			encoding: 'utf-8',
			maxFileSize: configParams.maxFileSize,
			uploadDir: uploadDir,
			multiples: true, // req.files to be arrays of files
			keepExtensions: true
		};
	};

	this.findFileType = (reqType) => {
		const extension = (reqType).split('/')[1].toLowerCase();
		if (extension.includes('tif')) {
			return 'raster';
		}
		else if (extension === 'jpg' || extension === 'jpeg' || extension === 'dng') {
			return 'image';
		}
		else if (extension === 'xml') {
			return 'xml';
		}
		else {
			return 'vector';
		}
	};

	// this.createDir = (targetDir, opts) => {
	this.createDir = (dirPath) => {
		console.log('start creating a directory...');
		console.log(`createDir: dir path = ${dirPath}`);
		try {
			fs.mkdirSync(dirPath);
			console.log(`Directory ${dirPath} created!`);
		} catch (err) {
			if (err.code === 'EEXIST') { // dirPath already exists!
				console.log(`Directory ${dirPath} already exists!`);
				return dirPath;
			} else {
				console.log(`error occured trying to make Directory ${dirPath}! - ${err}`);
			}
		}
	};

	this.removeFile = (filePath) => {
		fs.remove(filePath, err => {
			console.log('start removing a file...');
			if (err) {
				return console.error(err);
			} else {
				console.log(`the file '${filePath}' was removed!'`);
				return 'ok';
			}
		});
	};

	this.fileToZip = (filename, uploadPath) => {
		// define the layers parameters for the zip operation
		return [
			{
				content: '',
				name: filename,
				mode: 0o755,
				comment: '',
				date: new Date(),
				type: 'file'
			},
			{
				path: uploadPath,
				name: 'uploads'
			}
		];
	};
};
