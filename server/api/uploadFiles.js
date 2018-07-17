const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const fs = require('fs-extra');
const { execSync } = require('child_process');          // for using the cURL command line
const path = require('path');
const AdmZip = require('adm-zip');
require('./fileMethods')();
require('./curlMethods')();

const uploadDir = '/public/uploads/';
const dirPath = __dirname.replace(/\\/g, "/");
const uploadPath = `${dirPath}${uploadDir}`;
const jsonPath = `${dirPath}/public/json`;

const opts = setOptions(uploadPath);
router.use(formidable(opts));

router.post('/:worldName', (req, res) => {
    const workspaceName = req.params.worldName;
    let reqFiles = req.files.uploads;
    let fileType;
    let isZipped;

    console.log("req files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);
    console.log("uploadPath: " + uploadPath);

    // check if need to do a ZIP file
    if (!reqFiles.length && (reqFiles.name.includes('.zip') || reqFiles.size < 5000000)){
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

    if (!isZipped){
        // upload single file
        const file = beforeUpload(reqFiles);
        console.log("uploadToGeoserver single file");
        uploadToGeoserver(fileType, file.filename, file.filePath);

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
        uploadToGeoserver(fileType, zipFilename, zipFilePath);

    }

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

    // adding the GeoTiff file to the workspace in geoserver using the cURL command line:
    function uploadToGeoserver(fileType, filename, filePath) {
        // 1. create the JSON file with the desire workspace
        let importJSON = {};
        if (fileType === 'raster' || fileType === 'zip') {
            importJSON = createImportObject(workspaceName);
        } else {
            importJSON = createImportObjectWithData(workspaceName, filePath);
        }
        console.log("importJSON: " + JSON.stringify(importJSON));

        // 2. create an empty import with no store as the target
        const importObj = getImportObj(JSON.stringify(importJSON));
        console.log("import: " + JSON.stringify(importObj));
        console.log("file type + importId: " + fileType + ", " + importObj.id);

        // 3. POST the file to the tasks list, in order to create an import task for it
        const task = sendToTask(filePath, filename, importObj.id);
        console.log("task: " + JSON.stringify(task));

        // 4. Vector single file - check if the projection exists
        console.log("reqFiles length: " + reqFiles.length);
        if (fileType === 'vector' && !reqFiles.length){
            console.log("task state: " + task.state);
            if (task.state === 'NO_CRS') {
                // create the update SRS Json file and update the task
                const updateSrsJson = JSON.stringify(createLayerSrsUpdate());
                updateSrs(updateSrsJson, importObj.id, task.id);
            }
        }

        // 5. execute the import task
        executeFileToGeoserver(importObj.id);

        // 6. remove the file from the local store
        removeFile(filePath);

        // 7. delete all the uncompleted tasks in the import queue
        deleteUncompleteImports();

        // 8. send OK
        res.send("the file was Successfully upload!!!");
    }

});

module.exports = router;
