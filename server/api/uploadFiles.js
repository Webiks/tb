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
    const reqFiles = req.files.uploads;

    console.log("req files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);
    console.log("uploadPath: " + uploadPath);

    if (!reqFiles.length){
        // upload single file
        const fileType = findFileType(reqFiles.type);             // find the file type
        const filename = reqFiles.name;
        const filePath = uploadPath + filename;
        console.log("filePath: " + filePath);
        renameFile(reqFiles.path, filePath);                     // renaming the file full path
        console.log("uploadToGeoserver single file");
        uploadToGeoserver(fileType, filename, filePath);

    } else {
        // upload multiple files - creating a ZIP file
        // set the ZIP name according to the first file name
        const splitName = (reqFiles[0].name).split('.');
        const zipFilename = `${splitName[0]}.zip`;
        const zipFilePath = uploadPath + zipFilename;
        console.log("zipFilePath: " + zipFilePath);
        const zipFileType = 'zip';

        // creating archives
        let zip = new AdmZip();

        // define the names of the files to be zipped (in Sync opperation)
        reqFiles.map( file => {
            console.log("req file: " + JSON.stringify(file));
            const filePath = uploadPath + file.name;
            renameFile(file.path, filePath);

            // add local file to the zip file
            console.log("add to zip file: " + filePath);
            zip.addLocalFile(filePath);

            // remove the original file that was added to the zip file
            removeFile(filePath);
        });

        // write everything to disk
        console.log("write zip file: " + zipFilePath);
        zip.writeZip(zipFilePath);

        // upload the zip file to GeoServer
        uploadToGeoserver(zipFileType, zipFilename, zipFilePath);

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
