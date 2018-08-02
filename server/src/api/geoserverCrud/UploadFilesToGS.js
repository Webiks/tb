require('../fileMethods')();
require('./curlMethods')();

class UploadFilesToGS {

    static uploadFile(workspaceName, file, fileType, filename, filePath) {
        // 1. create the JSON file with the desire workspace
        let importJSON = {};
        if (fileType.toLowerCase() === 'raster' || fileType === 'zip') {
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
        if (fileType === 'vector' && !file.length){
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

        // 8. return OK
        return file;
    }
}

module.exports = UploadFilesToGS;
