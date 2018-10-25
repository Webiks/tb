const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const AdmZip = require('adm-zip');
const UploadFilesToGS = require ('./UploadFilesToGS');
const UploadFilesToFS = require('./UploadFilesToFS');
const fs = require('fs-extra');
require('../fs/fileMethods')();

const uploadDir = '/public/uploads/';
const dirPath = __dirname.replace(/\\/g, "/");
const uploadPath = `${dirPath}${uploadDir}`;

const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:workspaceName', (req, res) => {
	const workspaceName = req.params.workspaceName;
	let reqFiles = req.files.uploads;

	console.log("req Files: " + JSON.stringify(reqFiles));
	console.log("req length: " + reqFiles.length);
	console.log("uploadPath: " + uploadPath);

	// convert the request Files to JSON and back to an Object
	const jsonFiles = JSON.stringify(reqFiles);
	reqFiles = JSON.parse(jsonFiles);

	let name;
	let path;
	let file;
	if (!reqFiles.length){
		file = reqFiles;
	} else {
		file = reqFiles[0];
	}
	// find the file type
	const fileType = findFileType(file.type);

	// check if need to make a ZIP file
	if (!reqFiles.length){
		// upload a single file to GeoServer
		console.log("uploadToGeoserver single file...");
		console.log("req files (before): " + JSON.stringify(reqFiles));
		reqFiles = setBeforeUpload(reqFiles, fileType);
		name = reqFiles.name;
		path = reqFiles.filePath;
		console.log("UploadFiles SINGLE req file(after): " + JSON.stringify(reqFiles));
	} else {
		// creating a ZIP file
		console.log("uploadToGeoserver multi files...");
		// set the ZIP name according to the first file name
		const splitName = (reqFiles[0].name).split('.');
		name = `${splitName[0]}.zip`;
		path = uploadPath + name;

		// creating archives
		let zip = new AdmZip();

		// define the names of the files to be zipped (in Sync operation)
		reqFiles = reqFiles.map( file => {
			let newFile = setBeforeUpload(file, fileType);
			console.log("newFile: " + JSON.stringify(newFile));

			// add the local file to the zip file
			zip.addLocalFile(newFile.encodePathName);

			// remove the original file that was added to the zip file
			removeFile(newFile.encodePathName);

			return newFile;
		});

		// write everything to disk
		console.log("write zip file: " + path);
		zip.writeZip(path);
	}
	console.log("UploadFiles SEND req files: " + JSON.stringify(reqFiles));

	// send to the right upload handler according to the type
	let files;
	if (fileType === 'image' || fileType === 'xml'){
		// save the file in the File System
		files = UploadFilesToFS.uploadFile(workspaceName, reqFiles, name, path);
	} else {
		// upload the file to GeoServer
		files = UploadFilesToGS.uploadFile(workspaceName, reqFiles, name, path);
	}
	// remove the files from the local store
	removeFile(path);
	// if ZIP files: remove the zip file
	// send the path in the return files object to remove the zip directory after uploading the layer in geoserver
	const splitPath = path.split('.');
	if (splitPath[1] === 'zip') {
		files.map(file => {
			if (file.fileType.toLowerCase() === 'vector') {
				file.splitPath = splitPath[0].trim();
			} else {
				file.splitPath = null;
				removeFile(splitPath[0]);
			}
		});
	} else {
		console.log("this file is not a ZIP!");
		files[0].splitPath = null;
		console.log("splitPath: " + files[0].splitPath);
	}
	res.send(files);

	// ========================================= private  F U N C T I O N S ============================================
	// prepare the file before uploading it to the geoserver
	function setBeforeUpload(file, fileType) {
		console.log("setBeforeUpload File: " + JSON.stringify(file));
		const name = file.name;
		const filePath = uploadPath + name;
		const encodeFileName = encodeURI(name);
		const encodePathName = uploadPath + encodeFileName;

		const newFile = {
			name,
			size: file.size,
			path: file.path,
			mtime: new Date(file.mtime).toISOString(),
			fileType,
			filePath,
			encodeFileName,
			encodePathName
		};

		// renaming the file full path (according to the encoded name)
		fs.renameSync(file.path, newFile.encodePathName);

		return newFile;
	}
});

module.exports = router;