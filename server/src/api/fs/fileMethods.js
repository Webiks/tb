const fs = require('fs-extra');
const path = require('path');

require('../../config/serverConfig')();
const configParams = config().configParams;

module.exports = function() {
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
			if ( extension.includes('tif')){
					return 'raster';
			}
			else if ( extension === 'jpg' || extension === 'jpeg' || extension === 'dng'){
					return 'image';
			}
			else if ( extension === 'xml'){
				return 'xml';
			}
			else {
				return 'vector';
			}
	};

	this.createDir = (targetDir, opts) => {
		console.log('start creating a directory...');
		console.log(`createDir: dir path = ${targetDir}`);
		const isRelativeToScript = opts && opts.isRelativeToScript;
		const sep = path.sep;
		const initDir = path.isAbsolute(targetDir) ? sep : '';
		const baseDir = isRelativeToScript ? __dirname : '.';

		return targetDir.split(sep).reduce((parentDir, childDir) => {
			const curDir = path.resolve(baseDir, parentDir, childDir);
			try {
				fs.mkdirSync(curDir);
				console.log(`Directory ${curDir} created!`);
			} catch (err) {
				if (err.code === 'EEXIST') { // curDir already exists!
					console.log(`Directory ${curDir} already exists!`);
					return curDir;
				}

				// To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows
				if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
					throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
				}

				const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
				if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
					throw err; // Throw if it's just the last created dir.
				}
			}

			return curDir;
		}, initDir);
	};

	this.renameFile = (temp_path, new_path) => fs.renameSync(temp_path, new_path);

	this.removeFile = (filePath) => {
		fs.remove(filePath, err => {
			console.log('start removing a file');
			if (err){
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
							type: 'file' },
					{
							path: uploadPath,
							name: 'uploads'
					}
			];
	};
};
