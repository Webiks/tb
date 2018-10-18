require('../fs/fileMethods')();
require('../../config/serverConfig')();
const configUrl = configBaseUrl().configUrl;

// upload files to the File System
class UploadFilesToFS {

	static uploadFile(workspaceName, reqFiles, name, path) {
		let files = reqFiles.length ? reqFiles : [reqFiles];
		console.log("starting to uploadFile to FS...");
		console.log("uploadFile to FS files: " + JSON.stringify(files));
		console.log("uploadFile PATH: " + path);

		if (files.length !== 0) {
			// 1. creating a new directory by the name of the workspace (if not exist)
			const dirName =  __dirname.replace(/\\/g, "/");
			const dirPath = `${dirName}/public/uploads/${workspaceName}`;
			console.log(`UploadFilesToFS: dir path = ${dirPath}`);
			createDir(dirPath);
			console.log(`the '${dirPath}' directory was created!`);

			// 2. read the files and write them into the directory
			files = files.map( file => {
				const filePath = `${dirPath}/${file.name}`;
				console.log(`filePath: ${filePath}`);
				renameFile(file.filePath, filePath);
				console.log(`the '${file.name}' was rename!`);
				file.filePath = filePath;
				return {...file};
			});
			console.log("file: " + JSON.stringify(files));

		} else {
			console.log("there ara no files to upload!");
			files = [];
		}

		// return the files
		console.log("return files: " + JSON.stringify(files));
		return files;
	}
}

module.exports = UploadFilesToFS;
