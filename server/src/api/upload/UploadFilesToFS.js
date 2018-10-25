const exif = require('exif-parser');
const fs = require('fs-extra');
require('../fs/fileMethods')();

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

			// 2. move the files into the directory
			files = files.map( file => {
				const filePath = `${dirPath}/${file.name}`;
				console.log(`filePath: ${filePath}`);
				fs.renameSync(file.filePath, filePath);
				console.log(`the '${file.name}' was rename!`);
				file.filePath = filePath;
				// 3. get the metadata of the image
				const imagefile = getMetadata(file);
				return {...imagefile};
			});
			console.log("file: " + JSON.stringify(files));

		} else {
			console.log("there ara no files to upload!");
			files = [];
		}

		// return the files
		console.log("return files: " + JSON.stringify(files));
		return files;

		// ============================================= Private Functions =============================================
		// get the metadata of the image file
		function getMetadata(file) {
			console.log("start get Metadata: " + JSON.stringify(file));
			const buffer = fs.readFileSync(file.filePath);
			const parser = exif.create(buffer);
			const result = parser.parse();
			const tags = result.tags;
			console.log("result tags: " + JSON.stringify(tags));
			// exif.enableXmp(); - need to check

			return {...file, tags};
		}
	}
}

module.exports = UploadFilesToFS;
