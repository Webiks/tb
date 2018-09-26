// const GsLayers  = require("../geoserverCrud/GsLayers");
require('../fs/fileMethods')();
require('./curlMethods')();
// require('../../config/serverConfig')();
// const configParams = config().configParams;
// const configUrl = configBaseUrl().configUrl;

class UploadFilesToGS {

    static uploadFile(workspaceName, reqFiles, name, path) {
    		let files = reqFiles.length ? reqFiles : [reqFiles];
				console.log("uploadFile files: " + JSON.stringify(files));
				console.log("uploadFile PATH: " + path);

        // 1. create the JSON files with the desire workspace
        let importJSON = {};

				console.log("files Type: " + files[0].fileType);
        if (files[0].fileType.toLowerCase() === 'raster') {
            importJSON = createImportObject(workspaceName);
        } else {
            importJSON = createImportObjectWithData(workspaceName, path);
        }
        console.log("importJSON: " + JSON.stringify(importJSON));

        // 2. get the Import object by POST the JSON files and check it
        let importObj = postImportObj(JSON.stringify(importJSON));
        console.log("import: " + JSON.stringify(importObj));

        // 3a. for VECTORS only:
				if (files[0].fileType.toLowerCase() === 'vector') {
					// check the STATE of each task in the Task List
					console.log("check the state of each task... ");
					importObj.tasks.map( task => {
						console.log(`task ${task.id} state = ${task.state}`);
						if (task.state !== 'READY') {
							// get the task object
							task = getTaskObj(importObj.id, task.id);
							console.log(`task ${task.id} (before change): ${JSON.stringify(task)}`);
							// check the state's error and fix it
							if (task.state === 'NO_CRS') {
								const updateLayerJson = JSON.stringify(layerSrsUpdate());
								console.log("NO_CRS updateTaskJson: " + updateLayerJson);
								// create the update SRS Json files and update the task
								updateTaskField(updateLayerJson, importObj.id, task.id, 'layer');
							} else {
									files = [];
							}
						}
					});
				}
				// 3b. for RASTERS only: POST the files to the tasks list, in order to create an import task for it
				else {
					sendToTask(path, name, importObj.id);
				}

        // 4. execute the import task
        executeFileToGeoserver(importObj.id);

				// 5. delete all the uncompleted tasks in the import queue
				deleteUncompleteImports();

				// 6. remove the files from the local store
				removeFile(path);
				// if ZIP files:
				// send the path in the return files object to remove the zip directory after uploading the layer in geoserver
				const splitPath = path.split('.');
				if (splitPath[1] === 'zip'){
					files.map( file => {
						if (file.fileType.toLowerCase() === 'vector'){
							file.splitPath = splitPath[0].trim();
						} else {
							file.splitPath = null;
							removeFile(splitPath[0]);
						}
					});
				} else {
					console.log("the files is no a ZIP!");
					files[0].splitPath = null;
					console.log("splitPath: " + files[0].splitPath);
				}

				// 7. return the files
				console.log("return files: " + JSON.stringify(files));
				return files;
    }
}

module.exports = UploadFilesToGS;
