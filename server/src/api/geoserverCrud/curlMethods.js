const { execSync } = require('child_process');          // for using the cURL command line
require('../../config/serverConfig')();

const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

// // setting the cURL commands line (name and password, headers, request url)
const baseCurl = configParams.baseCurl;
const curlContentTypeHeader = '-H "Content-type:application/json"';
const curlAcceptHeader = '-H  "accept:application/json"';

module.exports = function() {

    //====================
    //  create JSON Files
    //====================
    // create the Workspace Json file for creating a new workspace
    this.createWorkspaceObject = (workspaceName) => {
        return {
            workspace: {
                name: workspaceName
            }
        };
    };

    // create the import Json file for uploading files (Rasters or Vectors)
    this.createImportObject = (workspaceName) => {
        return {
            import: {
                targetWorkspace: {
                    workspace: {
                        name: `"${workspaceName}"`
                    }
                }
            }
        };
    };

    // adding the data inside the import Json file for uploading Vectors
    this.createImportObjectWithData = (workspaceName, filePath) => {
        const importObject = this.createImportObject(workspaceName);
        const data = {
            type: `"file"`,
            file: `"${filePath}"`
        };
        console.log("import object with data");
        return { ...importObject, data};
    };

    // update the missing projection when uploading a .SHP file
    this.createLayerSrsUpdate = () => {
        return {
            layer: {
                srs: `"EPSG:4326"`
            }
        }
    };

    //============
    //  WORKSPACE
    //============
    // CREATE a new workspace in geoserver
    this.createNewWorkspaceInGeoserver = (workspaceJsonFile) => {
        console.log("Creating a new Workspace using the cURL...");
        const curl_createWorkspace = `${baseCurl} -XPOST ${curlContentTypeHeader} -d "${workspaceJsonFile}" ${configUrl.baseWorkspacesUrlGeoserver}`;
        console.log("succeed to create a new workspace in geoserver..." + curl_createWorkspace);
        return execSync(curl_createWorkspace);
    };

    // UPDATE the workspace's name in geoserver
    this.updateWorkspaceInGeoserver = (workspaceName, newName) => {
        console.log("Updateing Workspace's name using the cURL...");
        const curl_updateWorkspace = `${baseCurl} -XPUT ${configUrl.baseWorkspacesUrlGeoserver}/${workspaceName} ${curlAcceptHeader} ${curlContentTypeHeader} -d "{ \"name\": \"${newName}\" }"`;
        console.log(`succeed to update ${workspaceName} workspace to ${newName} ... ${curl_updateWorkspace}`);
        return execSync(curl_updateWorkspace);
    };

    // DELETE a workspace from geoserver
    this.deleteWorkspaceFromGeoserver = (workspaceName) => {
        console.log(`Deleting ${workspaceName} Workspace using the cURL...`);
        const curl_deleteWorkspace = `${baseCurl} -XDELETE ${configUrl.baseWorkspacesUrlGeoserver}/${workspaceName}?recurse=true ${curlAcceptHeader} ${curlContentTypeHeader}`;
        console.log("succeed to delete workspace " + curl_deleteWorkspace + " from geoserver");
        return execSync(curl_deleteWorkspace);
    };

    //============
    //   LAYERS
    //============
    // upload new layer to geoserver by the importer extension
    this.getImportObj = (importJson) => {
        console.log("Upload File using the cURL...");
        // 1. create a empty import with no store as the target
        const curl_createEmptyImport = `${baseCurl} -XPOST ${curlContentTypeHeader} -d "${importJson}" ${configUrl.reqImportCurl}`;
        console.log("step 1 is DONE..." + curlContentTypeHeader);
        const importJSON = execSync(curl_createEmptyImport);
        const importObj = JSON.parse(importJSON);
        return importObj.import;
    };

    this.sendToTask = (filepath, filename, importId) => {
        //POST the GeoTiff file to the tasks list, in order to create an import task for it
        console.log("sendToTask: filepath: " + filepath);
        const curlFileData = `-F name=${filename} -F filedata=@${filepath}`;
        console.log("sendToTask: curlFileData: " + curlFileData);

        const curl_postToTaskList = `${baseCurl} ${curlFileData} ${configUrl.reqImportCurl}/${importId}/tasks`;
        const taskJson = execSync(curl_postToTaskList);
        console.log("taskJSON: " + taskJson);
        const task = JSON.parse(taskJson);
        console.log("sent to the Tasks Queue..." + JSON.stringify(task));
        return task.task;
    };

    this.updateSrs = (updateSrsJson, importId, taskId) => {
        // update the import Json file with a default projection
        const curl_updateSrs = `${baseCurl} -XPUT ${curlContentTypeHeader} -d "${updateSrsJson}" ${configUrl.reqImportCurl}/${importId}/tasks/${taskId}/layer/`;
        console.log("updateSrs: " + curl_updateSrs);
        return execSync(curl_updateSrs);
    };

    this.executeFileToGeoserver = (importId) => {
        // execute the import task
        const curl_execute = `${baseCurl} -XPOST ${configUrl.reqImportCurl}/${importId}`;
        const execute = execSync(curl_execute);
        console.log("The execute is DONE..." + execute);
        console.log("DONE!");
    };

    this.deleteUncompleteImports = () => {
        // delete the task from the importer queue
        const curl_deletsTasks = `${baseCurl} -XDELETE ${curlAcceptHeader} ${curlContentTypeHeader} ${configUrl.reqImportCurl}`;
        const deleteTasks = execSync(curl_deletsTasks);
        console.log("Delete task from the Importer..." + deleteTasks);
        console.log("DONE!");
    };

};
