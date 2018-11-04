const GsLayers = require('./GsLayers');
const turf = require('@turf/turf');

// 1. get the layer's info (resource)
const getLayerInfoFromGeoserver = (worldLayer, worldId, layerName) => {
	return GsLayers.getLayerInfoFromGeoserver(worldId, layerName)
		.then(layerInfo => {
			console.log('1. got Layer Info...');
			console.log('1. worldLayer: ', JSON.stringify(worldLayer));
			worldLayer.layer = layerInfo.layer;
			worldLayer.layer.type = layerInfo.layer.type.toUpperCase();         // set the layer type
			return layerInfo.layer.resource.href;
		});
};

// 2. get the layer's details
const getLayerDetailsFromGeoserver = (worldLayer, resourceUrl) => {
	return GsLayers.getLayerDetailsFromGeoserver(resourceUrl)
		.then(layerDetails => {
			let latLonBoundingBox;
			// get the layer details data according to the layer's type
			console.log('2. got Layer Details...');
			console.log('2. worldLayer: ', JSON.stringify(worldLayer));
			if (worldLayer.layer.type.toLowerCase() === 'raster') {
				worldLayer.data = parseLayerDetails(worldLayer, layerDetails.coverage);
				console.log('getLayerDetailsFromGeoserver data: ', JSON.stringify(worldLayer.data));
				worldLayer.data.metadata = { dirName: layerDetails.coverage.metadata.entry.$ };
			}
			else if (worldLayer.layer.type.toLowerCase() === 'vector') {
				worldLayer.data = parseLayerDetails(worldLayer, layerDetails.featureType);
				worldLayer.data.metadata = { recalculateBounds: layerDetails.featureType.metadata.entry.$ };
			}
			else {
				res.status(500).send('ERROR: unknown layer TYPE!');
			}
			// set the data center point
			worldLayer.data.center =
				[worldLayer.data.latLonBoundingBox.minx, worldLayer.data.latLonBoundingBox.maxy];
			console.log('getLayerDetailsFromGeoserver data center: ', JSON.stringify(worldLayer.data.center));
			const centerPoint = worldLayer.data.center;
			console.log('getLayerDetailsFromGeoserver center point: ', JSON.stringify(centerPoint));

			// set the Polygon field for Ansyn
			const polygon = worldLayer.data.latLonBoundingBox;
			console.log('getLayerDetailsFromGeoserver polygon: ', JSON.stringify(polygon));
			const bbox = [polygon.minx, polygon.miny, polygon.maxx, polygon.maxy];
			const footprint = turf.bboxPolygon(bbox);
			console.log('getLayerDetailsFromGeoserver footprint: ', JSON.stringify(footprint));
			worldLayer.geoData = { centerPoint, bbox, footprint };
			console.log('getLayerDetailsFromGeoserver geoData: ', JSON.stringify(worldLayer.geoData));

			// set the store's name
			worldLayer.layer.storeName = (worldLayer.layer.storeId).split(':')[1];
			return worldLayer.data.store.href;
		});
};

// 3. get the store's data
const getStoreDataFromGeoserver = (worldLayer, storeUrl) => {
	return GsLayers.getStoreDataFromGeoserver(storeUrl)
		.then(store => {
			console.log('3. got Store Data...');
			// get the store data according to the layer's type
			let url;
			if (worldLayer.layer.type.toLowerCase() === 'raster') {
				console.log('dbLayer get RASTER data...');
				worldLayer.store = store.coverageStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.coverageStore.connectionParameters.entry.$
					}
				};
				worldLayer.filePath = store.coverageStore.url;                          // for the file path
				console.log('dbLayer RASTER url = ', worldLayer.filePath);
				worldLayer.format = store.coverageStore.type.toUpperCase();       			// set the format
			}
			else if (worldLayer.layer.type.toLowerCase() === 'vector') {
				console.log('dbLayer get VECTOR data...');
				worldLayer.store = store.dataStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.dataStore.connectionParameters.entry[0].$,
						url: store.dataStore.connectionParameters.entry[1].$
					}
				};
				worldLayer.filePath = worldLayer.store.connectionParameters.url;        // for the file path
				console.log('dbLayer VECTOR url = ', worldLayer.filePath);
				worldLayer.format = store.dataStore.type.toUpperCase();           			// set the format
			}
			else {
				res.status(500).send('ERROR: unknown layer TYPE!');
			}
			// set the store fields
			worldLayer.store.storeId = worldLayer.layer.storeId;
			worldLayer.store.name = worldLayer.layer.storeName;
			worldLayer.store.type = worldLayer.layer.type;

			console.log(`dbLayer store data: ${worldLayer.store.storeId}, ${worldLayer.store.type}`);

			// set the file name
			const path = worldLayer.filePath;
			console.log('dbLayer filePath: ', worldLayer.filePath);
			const extension = path.substring(path.lastIndexOf('.'));
			worldLayer.fileName = `${worldLayer.store.name}${extension}`;
			console.log('dbLayer fileName: ', worldLayer.fileName);
			// return the world-layer with all the data from GeoServer
			return worldLayer;
		});
};

//================================================Private Functions=====================================================
// delete the layer from GeoServer
const removeLayerFromGeoserver = (resourceUrl, storeUrl) => {
	// 1. delete the layer according to the resource Url
	// 2. delete the store
	return GsLayers.deleteLayerFromGeoserver(resourceUrl)
		.then(() => GsLayers.deleteLayerFromGeoserver(storeUrl));
};

// parse layer data
const parseLayerDetails = (worldLayer, data) => {
	worldLayer.data = data;
	// set the latLonBoundingBox
	worldLayer.data.latLonBoundingBox = data.latLonBoundingBox;
	// translate maps to objects
	worldLayer.data.nativeCRS =
		data.nativeCRS.$
			? data.nativeCRS.$
			: data.nativeCRS;
	worldLayer.data.nativeBoundingBox.crs =
		data.nativeBoundingBox.crs.$
			? data.nativeBoundingBox.crs.$
			: data.nativeBoundingBox.crs;
	// set the store's ID
	worldLayer.layer.storeId = data.store.name;

	return worldLayer.data;
};

module.exports = {
	getLayerInfoFromGeoserver,
	getLayerDetailsFromGeoserver,
	getStoreDataFromGeoserver,
	removeLayerFromGeoserver
};
