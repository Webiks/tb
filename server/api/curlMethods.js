const express = require('express');
const config = require('../config/configJson');
const { execSync } = require('child_process');          // for using the cURL command line

// setting the cURL commands line (name and password, headers, request url)
const baseCurl = config.baseCurl;
const curlContentTypeHeader = '-H "Content-type:application/json"';
const curlAcceptHeader = '-H  "accept:application/json"';
const reqImportCurl = config.baseUrlGeoserver.restImports;
const reqWorkspaceCurl = config.baseUrlGeoserver.restWorkspaces;

module.exports = function() {

    this.createWorkspaceObject = (workspaceName) => {
        return {
            workspace: {
                name: workspaceName
            }
        };
    };

    this.createImportObject = (workspaceName) => {
        return {
            import: {
                targetWorkspace: {
                    workspace: {
                        name: workspaceName
                    }
                }
            }
        };
    };

    this.createImportObjectWithData = (workspaceName, filePath) => {
        const importObject = this.createImportObject(workspaceName);
        const data = {
            type: 'file',
            file: filePath
        };
        console.log("import object with data");
        return { ...importObject, data};
    };

    //============
    //  WORKSPACE
    //============
    // CREATE a new workspace in geoserver
    this.createNewWorkspaceInGeoserver = (workspaceJsonFile) => {
        console.log("Creating a new Workspace using the cURL...");
        const curl_createWorkspace = `${baseCurl} -XPOST ${curlContentTypeHeader} -d "${workspaceJsonFile}" ${reqWorkspaceCurl}`;
        console.log("succeed to create a new workspace in geoserver..." + curl_createWorkspace);
        return execSync(curl_createWorkspace);
    };

    // UPDATE the workspace's name in geoserver
    this.updateWorkspaceInGeoserver = (workspaceName, newName) => {
        console.log("Updateing Workspace's name using the cURL...");
        const curl_updateWorkspace = `${baseCurl} -XPUT ${reqWorkspaceCurl}/${workspaceName} ${curlAcceptHeader} ${curlContentTypeHeader} -d "{ \"name\": \"${newName}\" }"`;
        console.log(`succeed to update ${workspaceName} workspace to ${newName} ... ${curl_updateWorkspace}`);
        return execSync(curl_updateWorkspace);
    };

    // DELETE a workspace from geoserver
    this.deleteWorkspaceFromGeoserver = (workspaceName) => {
        console.log(`Deleting ${workspaceName} Workspace using the cURL...`);
        const curl_deleteWorkspace = `${baseCurl} -XDELETE ${reqWorkspaceCurl}/${workspaceName}?recurse=true ${curlAcceptHeader} ${curlContentTypeHeader}`;
        console.log("succeed to delete workspace " + curl_deleteWorkspace + " from geoserver");
        return execSync(curl_deleteWorkspace);
    };

    //============
    //   LAYERS
    //============
    // upload new layer to geoserver by the importer extension
    this.uploadFileToGeoserverStepOne = (importJson) => {
        console.log("Upload File using the cURL...");
        // 1. create a empty import with no store as the target
        const curl_createEmptyImport = `${baseCurl} -XPOST ${curlContentTypeHeader} -d @${importJson} ${reqImportCurl}`;
        console.log("step 1 is DONE..." + curlContentTypeHeader);
        return execSync(curl_createEmptyImport);
    };

    this.findImportId = (curl) => {
        // find the import ID
        const importFromJson = JSON.parse(curl);
        console.log("importFromJson: " + JSON.stringify(importFromJson));
        return importFromJson.import.id;
    };

    this.sendToTask = (filepath, filename, importId) => {
        //POST the GeoTiff file to the tasks list, in order to create an import task for it
        console.log("sendToTask: filepath: " + filepath);
        const curlFileData = `-F name=${filename} -F filedata=@${filepath}`;
        console.log("sendToTask: curlFileData: " + curlFileData);

        const curl_postToTaskList = `${baseCurl} ${curlFileData} ${reqImportCurl}/${importId}/tasks`;
        const curl = execSync(curl_postToTaskList);
        console.log("sent to the Tasks Queue..." + curl);
    };

    this.executeFileToGeoserver = (importId) => {
        // execute the import task
        const curl_execute = `${baseCurl} -XPOST ${reqImportCurl}/${importId}`;
        const execute = execSync(curl_execute);
        console.log("The execute is DONE..." + execute);
        console.log("DONE!");
    };

    this.deleteUncompleteImports = () => {
        // delete the task from the importer queue
        const curl_deletsTasks = `${baseCurl} -XDELETE ${curlAcceptHeader} ${curlContentTypeHeader} ${reqImportCurl}`;
        const deleteTasks = execSync(curl_deletsTasks);
        console.log("Delete task from the Importer..." + deleteTasks);
        console.log("DONE!");
    };

};
