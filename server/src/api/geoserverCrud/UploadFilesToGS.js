require('../fileMethods')();
require('./curlMethods')();

class UploadFilesToGS {

    static uploadFile(workspaceName, reqFiles, name, path) {
    		const file = reqFiles.length ? reqFiles : [reqFiles];
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
					// A. check the FORMAT field in the data field in the Import Object and update it if it's missing
					if(importObj.data.format === null){
						importObj.data.format = 'Shapefile';
						const updateImportJson = JSON.stringify({ import: importObj });
						console.log("NO_FORMAT updateImportJson = " + updateImportJson);
					}

					// B. check the STATE of each task in the Task List
					console.log("taskList map... ");
					importObj.tasks.map( task => {
						console.log(`task ${task.id} state = ${task.state}`);
						if (task.state !== 'READY') {
							// get the task object
							task = getTaskObj(importObj.id, task.id);
							console.log(`task ${task.id} (before change): ${JSON.stringify(task)}`);
							// check the state's error and fix it
							switch (task.state) {
								case ('NO_FORMAT'):
									console.log("NO_FORMAT updateTaskJson: ");
									// create the update FORMAT Json file and update the import's data
									// updateTaskJson = JSON.stringify(dataFormatUpdate());
									task.data.format = 'Shapefile';
									task.transformChain.type = 'vector';
									const updateTaskJson = JSON.stringify({ task: task });
									console.log(`task ${task.id} (after the change): ${updateTaskJson}`);
									updateTaskById(updateTaskJson, importObj.id, task.id);
									break;
								case ('NO_CRS'):
									const updateLayerJson = JSON.stringify(layerSrsUpdate());
									console.log("NO_CRS updateTaskJson: " + updateLayerJson);
									// create the update SRS Json file and update the task
									updateTaskField(updateLayerJson, importObj.id, task.id, 'layer');
									break;
								default:
									// return an Error Massage with the task's state
									return `ERROR to upload the file! state: ${task.state}`;
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
				const splitPath = path.split('.');
        if (splitPath[1] === 'zip'){
					removeFile(splitPath[0]);
				}

        // 6. delete all the uncompleted tasks in the import queue
        deleteUncompleteImports();

        // 7. return OK
				console.log("return file: " + JSON.stringify(file));
        return file;
    }
}

module.exports = UploadFilesToGS;
