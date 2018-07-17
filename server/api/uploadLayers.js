const express = require('express');
const router = express.Router();
const axios = require('axios');
const formidable = require('express-formidable');
const zip = require('express-easy-zip');

require('../config/serverConfig')();
require('./fileMethods')();
require('./curlMethods')();

const configParams = config().configParams;
const uploadDir = '/public/uploads/';
const dirPath = __dirname.replace(/\\/g, "/");
const uploadPath = `${dirPath}${uploadDir}`;
const authorization = configParams.headers.Authorization;
const accept = configParams.headers.Accept;

const opts = setOptions(uploadPath);
router.use(formidable(opts));
router.use(zip());

router.post('/:worldName', (req, res) => {
    const workspaceName = req.params.worldName;
    const reqFiles = req.files.uploads;
    const urlImports = configParams.baseUrlGeoserver.restImports;
    let fileType = '';
    const filesToZip = [];
    let filePath = '';
    let filename = '';

    console.log("req files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);

    // upload a single file
    if (!reqFiles.length){
        fileType = findFileType(reqFiles.type);             // find the file type
        filename = reqFiles.name;
        filePath = uploadPath + filename;
        console.log("filePath: " + filePath);
        renameFile(reqFiles.path, filePath);                // renaming the files full path
        console.log("uploadToGeoserver a single file");
        uploadToGeoserver();
    }
    // upload multi files - create a zip file from all the chosen files
    else {
        const splitName = (reqFiles[0].name).split('.');
        filename = `${splitName[0]}.zip`;
        filePath = uploadPath + filename;
        console.log("filePath: " + filePath);
        const filesToZip = [];

        // saving all the files in a local directory by mapping the req.files array
        reqFiles.map( file => {
            console.log("req file name: " + file.name);
            fileType = findFileType(file.type);                // find the file type
            renameFile(file.path, filePath);                   // renaming the files full path

            // define the layers parameters for the zip operation
            filesToZip.push(fileToZip(file.name, uploadPath));
        });

        // compressing all the files to a single zip file
        console.log("filesToZip: " + JSON.stringify(filesToZip));
        res.zip({
            files: filesToZip,
            filename: filename
        })
            .then( success => {
                console.log(`succeed to zip the files to ${filename}`);
                // uploadToGeoserver();
                // console.log("uploadToGeoserver zip file");
            })
            .catch(function(err){
                console.log(err);	//if zip failed
            });

        console.log("uploadToGeoserver a zip file");
        uploadToGeoserver();
    }

    // adding the GeoTiff file to the workspace in geoserver using the cURL command line:
    function uploadToGeoserver() {
        console.log("start UPLOAD to GeoServer...");
        // 1. create an Import JSON file
        let importObj = {};
        if (fileType === 'raster') {
            importObj = createImportObject(workspaceName);
        }
        else{
            importObj = createImportObjectWithData(workspaceName, filePath);
        }
        const importJSON = JSON.stringify(importObj);

        // 2. send a POST request to create a empty import with no store as the target
        axios.post(urlImports, importJSON, { headers: configParams.headers })
            .then((response) => {
                console.log("post url: " + urlImports);
                console.log("post importJSON: " + importJSON);
                console.log("post header: " + JSON.stringify(req.headers));
                // find the import id
                const importId = response.data.import.id;
                console.log("2. response: " + JSON.stringify(response.data));
                console.log("importId: " + importId);

                // 3. POST the file to the tasks list, in order to create an import task for it
                /*
                const body = new FormData
                body.append("name", "test")
                body.append("filedata", "@box_gcp_fixed.tif")

                fetch("http://localhost:8080/geoserver/rest/imports/0/tasks", {
                    body,
                    headers: {
                        Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
                        "Content-Type": "multipart/form-data"
                    }
                })*/

                const fileData = {
                    name: filename,
                    filedata: `@${filePath}`
                };
                console.log("3. fileData: " + JSON.stringify(fileData));
                axios.post(`${urlImports}/${importId}/tasks`, JSON.stringify(fileData), { headers: { authorization, accept,
                                                                                     "Content-Type": "multipart/form-data"} })
                    .then ( tasks => {
                        console.log("3. task response: " + JSON.stringify(tasks.data));
                        // 4. execute the import task
                        axios.post(`${urlImports}/${importId}`, { headers: { authorization } })
                            .then ( result => {
                                console.log("The execute is DONE!!!: " + JSON.stringify(result.data));
                                // 5. remove all the temporary files
                                clearTempFiles();
                                res.send(result.data);
                            })
                            .catch((error) => {
                                console.error("error 4!", error);
                                res.status(404).send('Failed to execute the upload: ' + error);
                            });
                    })
                    .catch((error) => {
                        console.error("error 3!", error);
                        res.status(404).send('Failed to send the file to the tasks list: ' + error);
                    });
            })
            .catch((error) => {
                console.error("error 2!", error);
                res.status(404).send('Failed to upload the file: ' + error);
            });
    }

    function clearTempFiles() {
        // remove all the file from the local store + the zip file
        if (reqFiles.length > 1) {
            reqFiles.map(file => removeFile(filePath));
        }
        // remove the zip file
        removeFile(filePath);

        // delete all the uncompleted tasks in the import queue
        deleteUncompleteImports();
    }

});

module.exports = router;

