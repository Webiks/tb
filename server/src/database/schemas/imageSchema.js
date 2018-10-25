const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// FILE DATA: data from the upload file
const fileData = {
	name: String,														// the original name
	size: Number,                           // MB or KB
	lastModified: Number,										// the file created date in number
	fileCreatedDate: Date | String,					// the file created date
	fileUploadDate: Date | String,				  // the upload file date
	fileExtension: String,
	fileType: String,												// 'raster' or 'vector'
	filePath: String,
	encodeFileName: String,									// the encoded file name (differ when there is special charecters in the name)
	encodePathName: String,									// the encoded file path (differ when there is special charecters in the name)
	splitPath: String												// the zip path of the upload vector (for removing it later)
};

// IMAGE METADATA: metadata of the upload JPG image
const imageMetaData = {
	imageDescription: String,
	make: String,
	model: String,
	serialNumber: String,
	interopIndex: String,
	software: String,
	exifImageWidth: Number,
	exifImageHeight: Number,
	orientation: Number,
	xResolution: Number,
	yResolution: Number,
	resolutionUnit: Number,
	modifyDate: Number,
	dateTimeOriginal: Number,
	createdDate: Number,
	yCbCrPosition: Number,
	xPComment: Array[Number],
	gpsVersionId: [Number, Number, Number, Number],
	gpsLatitudeRef: String,
	gpsLatitude: Number,
	gpsLongitudeRef: String,
	gpsLongitude: Number,
	gpsAltitude: Number,
	exposureTime: Number,
	exposureProgram: Number,
	exposureCompensation: Number,
	exposureIndex: String,
	exposureMode: Number,
	fNumber: Number,
	iso: Number,
	compressedBitPerPixel: Number,
	shutterSpeedValue: Number,
	apertureValue: Number,
	maxApertureValue: Number,
	subjectDistance: Number,
	subjectDistanceRange: Number,
	meteringMode: Number,
	lightSource: Number,
	flash: Number,
	focalLength: Number,
	focalLengthIn35mmFormat: Number,
	colorSpace: Number,
	custumRendered: Number,
	whiteBalance: Number,
	digitalZoomRatio: String,
	sceneCaptureType: Number,
	gainControl: Number,
	constrast: Number,
	saturation: Number,
	sharpness: Number
};

// create the Image Schema
const ImageSchema = new Schema({
	workspaceName: String ,                         // the name of the GeoServer workspace
	worldLayerId: String ,                          // workspaceName: layername , unique : true
	name: String ,                                  // from GeoServer
	href: String ,                                  // href to the Layer page
	fileName: String,
	filePath: String,
	fileData,
	imageMetaData,
});

// create the image MODEL
const imageModel = mongoose.model('Image', ImageSchema);

module.exports = imageModel;
