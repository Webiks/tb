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
const jsonPath = `${dirPath}/public/json`;

const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:workspaceName', (req, res) => {
    const workspaceName = req.params.workspaceName;
    let reqFiles = req.files.uploads;
    let fileType;
    let isZipped;

    console.log("req files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);
    console.log("uploadPath: " + uploadPath);

    // check if need to do a ZIP file
    if (!reqFiles.length && (reqFiles.name.includes('.zip') || reqFiles.size < 1000000000)){
        isZipped = false;
        fileType = findFileType(reqFiles.type);
    } else {
        isZipped = true;
        fileType = 'zip';
        if (!reqFiles.length) {
            // define the file as an array
            reqFiles = [reqFiles];
        }
        console.log("req files Single Array: " + JSON.stringify(reqFiles));
    }

    console.log("isZipped: " + isZipped);
    let reqfiles;

    if (!isZipped){
        // upload a single file to GeoServer
        const file = beforeUpload(reqFiles);
        console.log("uploadToGeoserver single file");
        reqfiles = UploadFilesToGS.uploadFile(workspaceName, reqFiles, fileType, file.filename, file.filePath);
    } else {
        // upload multiple files - creating a ZIP file
        // set the ZIP name according to the first file name
        const splitName = (reqFiles[0].name).split('.');
        const zipFilename = `${splitName[0]}.zip`;
        const zipFilePath = uploadPath + zipFilename;
        console.log("zipFilePath: " + zipFilePath);

        // creating archives
        let zip = new AdmZip();

        // define the names of the files to be zipped (in Sync opperation)
        reqFiles.map( file => {
            console.log("req file: " + JSON.stringify(file));
            const newFile = beforeUpload(file);

            // add local file to the zip file
            zip.addLocalFile(newFile.filePath);

            // remove the original file that was added to the zip file
            removeFile(newFile.filePath);
        });

        // write everything to disk
        console.log("write zip file: " + zipFilePath);
        zip.writeZip(zipFilePath);

        // upload the zip file to GeoServer
        reqfiles = UploadFilesToGS.uploadFile(workspaceName,reqFiles, fileType, zipFilename, zipFilePath);
    }
    res.send(reqfiles);

    // ======================
    //   F U N C T I O N S
    // ======================
    // prepare the file before uploading it to the geoserver
    function beforeUpload(file) {
        const filename = file.name;
        const filePath = uploadPath + filename;
        console.log("filePath: " + filePath);

        // renaming the file full path
        renameFile(file.path, filePath);

        return {
            filename,
            filePath
        };
    }
});

module.exports = router;
