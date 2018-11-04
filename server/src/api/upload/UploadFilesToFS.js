const turf = require('@turf/turf');
const exif = require('exif-parser');
const fs = require('fs-extra');
require('../fs/fileMethods')();

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

// upload files to the File System
class UploadFilesToFS {

	static uploadFile(workspaceName, reqFiles, name, path) {
		let files = reqFiles.length ? reqFiles : [reqFiles];
		console.log('starting to uploadFile to FS...');
		console.log('uploadFile to FS files: ' + JSON.stringify(files));
		console.log('uploadFile PATH: ' + path);

		if (files.length !== 0) {
			// 1. creating a new directory by the name of the workspace (if not exist)
			const dirPath = `${configUrl.uploadUrlRelativy}/${workspaceName}`;
			console.log(`UploadFilesToFS: dir path = ${dirPath}`);
			createDir(dirPath);
			console.log(`the '${dirPath}' directory was created!`);

			// 2. move the files into the directory
			files = files.map(file => {
				const filePath = `${dirPath}/${file.name}`;
				console.log(`filePath: ${filePath}`);
				fs.renameSync(file.filePath, filePath);
				console.log(`the '${file.name}' was rename!`);
				const fullPath = `${configUrl.uploadUrl}/${workspaceName}/${file.name}`;
				file.filePath = fullPath;
				// 3. get the metadata of the image file
				const layer = getMetadata(file);
				console.log(`layer: ${JSON.stringify(layer)}`);
				// 4. get the geoData of the image file
				const geoData = setGeoData({ ...layer });
				console.log(`geoData: ${JSON.stringify({ ...geoData })}`);
				return { ...geoData };
			});
			console.log('file: ' + JSON.stringify(files));

		} else {
			console.log('there ara no files to upload!');
			files = [];
		}

		// return the files
		console.log('return files: ' + JSON.stringify(files));
		return files;

		// ============================================= Private Functions =============================================
		// get the metadata of the image file
		function getMetadata(file) {
			console.log('start get Metadata: ' + JSON.stringify(file));
			const buffer = fs.readFileSync(file.filePath);
			console.log('getMetadata reading filePath: ' + file.filePath);
			const parser = exif.create(buffer);
			const result = parser.parse();
			const imageData = result.tags;
			// exif.enableXmp(); - need to check
			console.log('getMetadata return file: ' + JSON.stringify({ ...file, imageData }));
			return { ...file, imageData };
		}

		// set the geoData from the image GPS
		function setGeoData(layer) {
			// set the center point
			const centerPoint = [layer.imageData.GPSLongitude, layer.imageData.GPSLatitude];
			console.log('setGeoData center point: ' + JSON.stringify(centerPoint));
			// get the Bbox
			const bbox = getBbboxFromPoint(centerPoint, 500);
			console.log('setGeoData polygon: ' + JSON.stringify(bbox));
			// get the footprint
			const footprint = getFootprintFromBbox(bbox);
			console.log('getLayerDetailsFromGeoserver footprint: ' + JSON.stringify(footprint));
			// set the geoData
			const geoData = { centerPoint, bbox, footprint };
			console.log('getLayerDetailsFromGeoserver geoData: ' + JSON.stringify(layer.geoData));
			return { ...layer, geoData };
		}

		// get the Boundry Box from a giving Center Point using turf
		function getBbboxFromPoint(centerPoint, radius) {
			const distance = radius / 1000; 					// the square size in kilometers
			const point = turf.point(centerPoint);
			const buffered = turf.buffer(point, distance, { units: 'kilometers', steps: 4 });
			return turf.bbox(buffered);
		}

		// get footprint from the Bbox
		function getFootprintFromBbox(bbox) {
			return turf.bboxPolygon(bbox);
		}
	}
}

module.exports = UploadFilesToFS;
