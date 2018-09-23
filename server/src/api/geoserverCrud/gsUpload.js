const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const fs = require('fs-extra');
const { execSync } = require('child_process');          // for using the cURL command line
const path = require('path');
const AdmZip = require('adm-zip');
const UploadFilesToGS = require ('./UploadFilesToGS');
require('../fileMethods')();

const uploadDir = '/public/uploads/';
const dirPath = __dirname.replace(/\\/g, "/");
const uploadPath = `${dirPath}${uploadDir}`;
// const jsonPath = `${dirPath}/public/json`;

const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:workspaceName', (req, res) => {
    const workspaceName = req.params.workspaceName;
    let reqFiles = req.files.uploads;

    console.log("req Files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);
    console.log("uploadPath: " + uploadPath);

		let name;
		let path;

		// find the file type
		let file;
		if (!reqFiles.length){
				file = reqFiles;
		} else {
				file = reqFiles[0];
		}
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

            return {...newFile};
        });

        // write everything to disk
        console.log("write zip file: " + path);
        zip.writeZip(path);
    }

		// upload the file to GeoServer
		console.log("UploadFiles SEND req files: " + JSON.stringify(reqFiles));
    // res.send(UploadFilesToGS.uploadFile(workspaceName, reqFiles, fileType, name, path, encodeFileName, encodePathName));
		res.send(UploadFilesToGS.uploadFile(workspaceName, reqFiles, name, path));

    // ========================================= private  F U N C T I O N S ============================================
    // prepare the file before uploading it to the geoserver
    function setBeforeUpload(file, fileType) {
			const fileName = file.name;
			const filePath = uploadPath + fileName;
			const encodeFileName = encodeURI(fileName);
			const encodePathName = uploadPath + encodeFileName;
			console.log("beforeUpload fileName: " + fileName);
			console.log("beforeUpload encoded fileName: " + encodeFileName);
			console.log("beforeUpload filePath: " + filePath);
			console.log("beforeUpload encoded filePath: " + encodePathName);

			const newFile = {
				fileType,
				filePath,
				encodeFileName,
				encodePathName
			};

			// renaming the file full path (according to the encoded name)
			renameFile(file.path, encodePathName);

			return { ...file, ...newFile };
    }
});

module.exports = router;
