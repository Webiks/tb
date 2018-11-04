const { execSync } = require('child_process');          // for using the cURL command line
require('../../config/serverConfig')();

const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

// // setting the cURL commands line (name and password, headers, request url)
const baseCurl = configParams.baseCurl;
const curlContentTypeHeader = '-H "Content-type:application/json"';
const curlAcceptHeader = '-H  "accept:application/json"';

module.exports = function () {

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

	// create the Workspace Json file for creating a new workspace
	this.createTargetWorkspaceObject = (workspaceName) => {
		return {
			workspace: {
				name: `"${workspaceName}"`
			}
		};
	};

	// create the import Json file for uploading files (Rasters or Vectors)
	this.createImportObject = (workspaceName) => {
		return {
			import: {
				targetWorkspace: this.createTargetWorkspaceObject(workspaceName)
			}
		};
	};

	// adding the data inside the import Json file for uploading Vectors
	this.createImportObjectWithData = (workspaceName, filePath) => {
		console.log('import object with data');
		return {
			import: {
				targetWorkspace: this.createTargetWorkspaceObject(workspaceName),
				data: {
					type: `"file"`,
					format: `"Shapefile"`,
					file: `"${filePath}"`
				}
			}
		};
	};

	// SHP file: update the missing format in the DATA field, when getting state: 'NO_FORMAT'
	this.dataFormatUpdate = () => {
		return {
			data: {
				format: `"Shapefile"`
			}
		};
	};


	// SHP file: update the missing projection in the LAYER field, when getting state: 'NO_CRS'
	this.layerSrsUpdate = () => {
		return {
			layer: {
				srs: `"EPSG:4326"`
			}
		};
	};

	//============
	//  WORKSPACE
	//============
	// CREATE a new workspace in geoserver
	this.createNewWorkspaceInGeoserver = (workspaceJsonFile) => {
		console.log('Creating a new Workspace using the cURL...');
		const curl_createWorkspace = `${baseCurl} -XPOST ${curlContentTypeHeader} -d "${workspaceJsonFile}" ${configUrl.baseWorkspacesUrlGeoserver}`;
		console.log('succeed to create a new workspace in geoserver...' + curl_createWorkspace);
		return execSync(curl_createWorkspace);
	};

	// UPDATE the workspace's name in geoserver
	this.updateWorkspaceInGeoserver = (workspaceName, newName) => {
		console.log('Updateing Workspace\'s name using the cURL...');
		const curl_updateWorkspace = `${baseCurl} -XPUT ${configUrl.baseWorkspacesUrlGeoserver}/${workspaceName} ${curlAcceptHeader} ${curlContentTypeHeader} -d "{ \"name\": \"${newName}\" }"`;
		console.log(`succeed to update ${workspaceName} workspace to ${newName} ... ${curl_updateWorkspace}`);
		return execSync(curl_updateWorkspace);
	};

	// DELETE a workspace from geoserver
	this.deleteWorkspaceFromGeoserver = (workspaceName) => {
		console.log(`Deleting ${workspaceName} Workspace using the cURL...`);
		const curl_deleteWorkspace = `${baseCurl} -XDELETE ${configUrl.baseWorkspacesUrlGeoserver}/${workspaceName}?recurse=true ${curlAcceptHeader} ${curlContentTypeHeader}`;
		console.log('succeed to delete workspace ' + curl_deleteWorkspace + ' from geoserver');
		return execSync(curl_deleteWorkspace);
	};

	//============
	//   LAYERS
	//============
	// upload new layer to geoserver by the importer extension

	// 1. POST the import JSON file to Geoserver
	this.postImportObj = (importJson) => {
		// the importer will return an import object (in Vectors - also will prepare the tasks automatically)
		console.log('Upload File using the cURL...');
		const curl_createEmptyImport = `${baseCurl} -XPOST ${curlContentTypeHeader} -d "${importJson}" ${configUrl.reqImportCurl}`;
		console.log('step 1 is DONE...' + curl_createEmptyImport);
		const importJSON = execSync(curl_createEmptyImport);
		console.log('importJSON: ' + importJSON);
		const importObj = this.IsJsonOK(importJSON);
		if (!importObj) {
			console.error('the importJSON is empty!');
			return null;
		} else {
			return importObj.import;
		}
	};

	this.getImportObj = (importId) => {
		// get the import file
		const curl_getImport = `${baseCurl} -XGET ${configUrl.reqImportCurl}/${importId}`;
		console.log('Get the import object...' + curl_getImport);
		const importJSON = execSync(curl_getImport);
		const importObj = this.IsJsonOK(importJSON);
		if (!importObj) {
			console.error('something is wrong with the JSON import file!');
			return null;
		} else {
			console.log('get the import object...' + JSON.stringify(task));
			return importObj.import;
		}
	};

	this.getDataObj = (importId) => {
		// get the Data file
		const curl_getTask = `${baseCurl} -XGET ${configUrl.reqImportCurl}/${importId}/data`;
		console.log('Get the task object...' + curl_getTask);
		const taskJSON = execSync(curl_getTask);
		const task = this.IsJsonOK(taskJSON);
		if (!task) {
			console.error('something is wrong with the JSON Data file!');
			return null;
		} else {
			console.log('get the data file...' + JSON.stringify(task));
			return task.task;
		}
	};

	this.getFileObj = (importId, fileName) => {
		// get the File data
		const curl_getTask = `${baseCurl} -XGET ${configUrl.reqImportCurl}/${importId}/data/files/${fileName}`;
		console.log('Get the task object...' + curl_getTask);
		const taskJSON = execSync(curl_getTask);
		const task = this.IsJsonOK(taskJSON);
		if (!task) {
			console.error('something is wrong with the JSON data file!');
			return null;
		} else {
			console.log('get the file data object...' + JSON.stringify(task));
			return task.task;
		}
	};

	this.getTaskObj = (importId, taskId) => {
		// get the task file
		const curl_getTask = `${baseCurl} -XGET ${configUrl.reqImportCurl}/${importId}/tasks/${taskId}`;
		console.log('Get the task object...' + curl_getTask);
		const taskJSON = execSync(curl_getTask);
		const task = this.IsJsonOK(taskJSON);
		if (!task) {
			console.error('something is wrong with the JSON task file!');
			return null;
		} else {
			console.log('get Task object...' + JSON.stringify(task));
			return task.task;
		}
	};

	this.getLayerObj = (importId, taskId) => {
		// get the layer file
		const curl_getLayer = `${baseCurl} -XGET ${configUrl.reqImportCurl}/${importId}/tasks/${taskId}/layer`;
		console.log('Get the layer object...' + curl_getLayer);
		const layerJSON = execSync(curl_getLayer);
		const layerObj = this.IsJsonOK(layerJSON);
		if (!layerObj) {
			console.error('something is wrong with the JSON layer file!');
			return null;
		} else {
			console.log('get layer object...' + JSON.stringify(layerObj));
			return layerObj.layer;
		}
		return layerObj.layer;
	};

	this.updateImportById = (updateImportJson, importId) => {
		// update the import Json file by ID
		const curl_updateImport = `${baseCurl} -XPUT ${curlContentTypeHeader} -d "${updateImportJson}" ${configUrl.reqImportCurl}/${importId}`;
		console.log('updateFormat: ' + curl_updateImport);
		return execSync(curl_updateImport);
	};

	this.updateImportField = (updateImportJson, importId, fieldName) => {
		// update the import Field
		const curl_updateImport = `${baseCurl} -XPUT ${curlContentTypeHeader} -d "${updateImportJson}" ${configUrl.reqImportCurl}/${importId}/${fieldName}`;
		console.log('updateFormat: ' + curl_updateImport);
		return execSync(curl_updateImport);
	};

	this.updateTaskById = (updateTaskJson, importId, taskId) => {
		// update the task in the import Json file by ID
		const curl_updateTask = `${baseCurl} -XPUT ${curlContentTypeHeader} -d "${updateTaskJson}" ${configUrl.reqImportCurl}/${importId}/tasks/${taskId}`;
		console.log('updateTask: ' + curl_updateTask);
		return execSync(curl_updateTask);
	};

	this.updateTaskField = (updateTaskJson, importId, taskId, fieldName) => {
		// update the task field in the import Json file
		const curl_updateTask = `${baseCurl} -XPUT ${curlContentTypeHeader} -d "${updateTaskJson}" ${configUrl.reqImportCurl}/${importId}/tasks/${taskId}/${fieldName}`;
		console.log('updateTask: ' + curl_updateTask);
		return execSync(curl_updateTask);
	};

	this.sendToTask = (filepath, filename, importId) => {
		//POST the GeoTiff file to the tasks list, in order to create an import task for it
		console.log('sendToTask: filepath: ' + filepath);
		const curlFileData = `-F name=${filename} -F filedata=@${filepath}`;
		console.log('sendToTask: curlFileData: ' + curlFileData);

		const curl_postToTaskList = `${baseCurl} ${curlFileData} ${configUrl.reqImportCurl}/${importId}/tasks`;
		console.log('sendToTask: curl_postToTaskList: ' + curl_postToTaskList);
		const taskJson = execSync(curl_postToTaskList);
		console.log('taskJSON: ' + taskJson);
		const tasks = this.IsJsonOK(taskJson);
		if (!tasks) {
			console.error('something is wrong with the JSON tasks file!');
			return null;
		} else {
			console.log('sent to the Tasks Queue...' + JSON.stringify(tasks));
			if (filepath.split('.')[1] === 'zip') {
				console.log('sendToTask zip file: ' + JSON.stringify(tasks.tasks));
				return tasks.tasks;
			} else {
				console.log('sendToTask single file: ' + JSON.stringify(tasks.task));
				return tasks.task;
			}
		}
	};

	this.executeFileToGeoserver = (importId) => {
		// execute the import task
		const curl_execute = `${baseCurl} -XPOST ${configUrl.reqImportCurl}/${importId}`;
		const execute = execSync(curl_execute);
		console.log('The execute is DONE...' + execute);
		console.log('DONE!');
	};

	this.deleteUncompleteImports = () => {
		// delete the task from the importer queue
		const curl_deletsTasks = `${baseCurl} -XDELETE ${curlAcceptHeader} ${curlContentTypeHeader} ${configUrl.reqImportCurl}`;
		const deleteTasks = execSync(curl_deletsTasks);
		console.log('Delete task from the Importer...' + deleteTasks);
		console.log('DONE!');
	};

	this.IsJsonOK = (jsonStr) => {
		try {
			return JSON.parse(jsonStr);
		} catch (e) {
			return null;
		}
	};
};
