require('../fs/fileMethods')();
require('../geoserverCrud/curlMethods')();

// upload files to GeoServer
class UploadFilesToGS {

	static uploadFile(worldId, reqFiles, name, path) {
		let files = reqFiles.length ? reqFiles : [reqFiles];
		console.log('starting to uploadFile to GeoServer...');
		console.log('uploadFile files: ' + JSON.stringify(files));
		console.log('uploadFile PATH: ' + path);

		if (files.length !== 0) {
			// 1. create the JSON files with the desire workspace
			let importJSON = {};

			console.log('files Type: ' + files[0].fileType);
			if (files[0].fileType.toLowerCase() === 'raster') {
				importJSON = createImportObject(worldId);
			} else {
				importJSON = createImportObjectWithData(worldId, path);
			}
			console.log('importJSON: ' + JSON.stringify(importJSON));

			// 2. get the Import object by POST the JSON files and check it
			let importObj = postImportObj(JSON.stringify(importJSON));
			console.log('import: ' + JSON.stringify(importObj));

			if (importObj) {
				// 3a. for VECTORS only:
				if (files[0].fileType.toLowerCase() === 'vector') {
					// check the STATE of each task in the Task List
					console.log('check the state of each task... ');
					importObj.tasks.map(task => {
						console.log(`task ${task.id} state = ${task.state}`);
						if (task.state !== 'READY') {
							// get the task object
							task = getTaskObj(importObj.id, task.id);
							console.log(`task ${task.id} (before change): ${JSON.stringify(task)}`);
							// check the state's error and fix it
							if (task && task.state === 'NO_CRS') {
								const updateLayerJson = JSON.stringify(layerSrsUpdate());
								console.log('NO_CRS updateTaskJson: ' + updateLayerJson);
								// create the update SRS Json files and update the task
								updateTaskField(updateLayerJson, importObj.id, task.id, 'layer');
							} else {
								console.log('something is wrong with the file!');
								files = [];
							}
						}
					});
					if (files.length !== 0) {
						files = uploadToGeoserver(importObj.id);
					}
				}
				// 3b. for RASTERS only: POST the files to the tasks list, in order to create an import task for it
				else {
					const rasterTasks = sendToTask(path, name, importObj.id);
					console.log('raster tasks: ' + JSON.stringify(rasterTasks));
					if (!rasterTasks) {
						console.log('something is wrong with the file!');
						files = [];
					} else {
						files = uploadToGeoserver(importObj.id);
					}
				}
			} else {
				console.log('something is wrong with the JSON file!');
				files = [];
			}

			// return the files
			console.log('return files: ' + JSON.stringify(files));
			return files;
		}

		// ============================================= Private Functions =============================================
		// upload the files to GeoServer
		function uploadToGeoserver(importObjId) {
			// 1. execute the import task
			console.log('start executeFileToGeoserver...');
			executeFileToGeoserver(importObjId);

			// 2. delete all the uncompleted tasks in the import queue
			deleteUncompleteImports();

			return files;
		}
	}
}

module.exports = UploadFilesToGS;

