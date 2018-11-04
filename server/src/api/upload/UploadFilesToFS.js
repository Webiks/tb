const turf = require('@turf/turf');
const exif = require('exif-parser');
const fs = require('fs-extra');
require('../fs/fileMethods')();
const createNewLayer = require('../databaseCrud/createNewLayer');

require('../../config/serverConfig')();
const configUrl = configBaseUrl().configUrl;

// upload files to the File System
class UploadFilesToFS {

	static uploadFile(worldId, reqFiles, name, path) {
		let files = reqFiles.length ? reqFiles : [reqFiles];
		console.log('starting to uploadFile to FS...');
		console.log('uploadFile to FS files: ' + JSON.stringify(files));
		console.log('uploadFile PATH: ' + path);

		if (files.length !== 0) {
			// 1. creating a new directory by the name of the workspace(form geoserver - if not exist)
			const dirPath = `${configUrl.uploadUrlRelativy}/${worldId}`;
			console.log(`UploadFilesToFS: dir path = ${dirPath}`);
			createDir(dirPath);
			console.log(`the '${dirPath}' directory was created!`);

			// 2. move the files into the directory
			const images = files.map(file => {
				const filePath = `${dirPath}/${file.name}`;
				console.log(`filePath: ${filePath}`);
				fs.renameSync(file.filePath, filePath);
				console.log(`the '${file.name}' was rename!`);
				const fullPath = `${configUrl.uploadUrl}/${worldId}/${file.name}`;

				// 3. set the file Data from the upload file
				const fileData = setFileData(file);
				console.log('1. set FileData: ' + JSON.stringify(fileData));

				// 4. set the world-layer data
				let worldLayer = setLayerFields(fileData, fullPath);
				console.log('2. worldLayer include Filedata: ' + JSON.stringify(worldLayer));

				// 5. get the metadata of the image file
				const metadata = getMetadata(worldLayer);
				console.log(`3. include Metadata: ${JSON.stringify(metadata)}`);

				// 6. set the geoData of the image file
				const geoData = setGeoData({ ...metadata });
				console.log(`4. include Geodata: ${JSON.stringify(geoData)}`);

				// 7. set the inputData of the image file
				const inputData = setInputData({ ...geoData });
				const newFile = { ...inputData };
				console.log(`5. include Inputdata: ${JSON.stringify(newFile)}`);

				// 8. save the file to mongo database and return the new file is succeed
				return createNewLayer(newFile, worldId)
					.then(newLayer => {
						console.log('createNewLayer result: ' + newLayer);
						return newLayer;
					})
					.catch(error => {
						console.error('ERROR createNewLayer: ' + error);
						return null;
					});
			});
			return Promise.all(images);
		} else {
			console.log('there ara no files to upload!');
			return [];
		}
		// ============================================= Private Functions =================================================
		// set the File Data from the ReqFiles
		function setFileData(file) {
			const name = file.name;
			const fileExtension = name.substring(name.lastIndexOf('.'));
			return {
				name,
				size: file.size,
				fileUploadDate: file.fileUploadDate,
				fileExtension,
				fileType: 'image',
				encodeFileName: file.encodeFileName,
				encodePathName: file.encodePathName,
				splitPath: null
			};
		}

		// set the world-layer main fields
		function setLayerFields(file, fullPath) {
			const name = (file.name).split('.')[0];

			return {
				name,
				fileName: file.name,
				filePath: fullPath,
				fileType: 'image',
				format: 'JPG',
				fileData: file
			};
		}

		// get the metadata of the image file
		function getMetadata(file) {
			console.log('start get Metadata...');
			const buffer = fs.readFileSync(file.filePath);
			const parser = exif.create(buffer);
			const result = parser.parse();
			const imageData = result.tags;
			file.fileData.fileCreatedDate = new Date(imageData.ModifyDate).toISOString();
			// exif.enableXmp(); - need to check
			return { ...file, imageData };
		}

		// set the geoData from the image GPS
		function setGeoData(layer) {
			// set the center point
			const centerPoint = [layer.imageData.GPSLongitude, layer.imageData.GPSLatitude];
			console.log('setGeoData center point: ' + JSON.stringify(centerPoint));
			// get the Bbox
			const bbox = getBbboxFromPoint(centerPoint, 200);
			console.log('setGeoData polygon: ' + JSON.stringify(bbox));
			// get the footprint
			const footprint = getFootprintFromBbox(bbox);
			console.log('setGeoData footprint: ' + JSON.stringify(footprint));
			// set the geoData
			const geoData = { centerPoint, bbox, footprint };
			console.log('setGeoData: ' + JSON.stringify(geoData));
			return { ...layer, geoData };
		}

		function setInputData(layer) {
			return {
				...layer,
				inputData: {
					fileName: layer.fileData.name,
					affiliation: 'UNKNOWN',
					GSD: 0,
					sensor: {
						maker: layer.imageData.Make,
						name: layer.imageData.Model,
						bands: []
					},
					flightAltitude: layer.imageData.GPSAltitude,
					cloudCoveragePercentage: 0
				}
			};
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
