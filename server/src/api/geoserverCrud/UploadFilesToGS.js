require('../fileMethods')();
require('./curlMethods')();

class UploadFilesToGS {

    static uploadFile(workspaceName, reqFiles, name, path) {
    		let file = reqFiles.length ? reqFiles : [reqFiles];
				console.log("uploadFile file: " + JSON.stringify(file));
				console.log("uploadFile PATH: " + path);

        // 1. create the JSON file with the desire workspace
        let importJSON = {};

				console.log("file Type: " + file[0].fileType);
        if (file[0].fileType.toLowerCase() === 'raster') {
            importJSON = createImportObject(workspaceName);
        } else {
            importJSON = createImportObjectWithData(workspaceName, path);
        }
        console.log("importJSON: " + JSON.stringify(importJSON));

        // 2. get the Import object by POST the JSON file and check it
        let importObj = postImportObj(JSON.stringify(importJSON));
        console.log("import: " + JSON.stringify(importObj));

        // 3a. for VECTORS only:
				if (file[0].fileType.toLowerCase() === 'vector') {
					// B. check the STATE of each task in the Task List
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
								// create the update SRS Json file and update the task
								updateTaskField(updateLayerJson, importObj.id, task.id, 'layer');
							} else {
									file = [];
							}
						}
					});
				}
				// 3b. for RASTERS only: POST the file to the tasks list, in order to create an import task for it
				else {
					sendToTask(path, name, importObj.id);
				}

        // 4. execute the import task
        executeFileToGeoserver(importObj.id);

        // 5. remove the file from the local store
        removeFile(path);
				// in ZIP file: remove the directory (after open the zip file)
			// 	const splitPath = path.split('.');
        // if (splitPath[1] === 'zip'){
			// 		removeFile(splitPath[0]);
			// 	}

        // 6. delete all the uncompleted tasks in the import queue
        deleteUncompleteImports();

        // 7. return OK
				console.log("return file: " + JSON.stringify(file));
        return file;
    }
}

module.exports = UploadFilesToGS;
