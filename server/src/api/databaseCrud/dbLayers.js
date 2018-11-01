const express = require('express');
const turf = require('@turf/turf');
const router = express.Router();

const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsLayers = require("../geoserverCrud/GsLayers");
const createNewLayer = require('./createNewLayer');

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

// ============== F U N C T I O N ======================
const handleError = (res, status, consoleMessage, sendMessage) => {
	console.error('db Layer: ' + consoleMessage);
	res.status(status).send(sendMessage);
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

// 1. get the layer's info (resource)
const getLayerInfoFromGeoserver = (worldLayer, worldId, layerName) => {
	return GsLayers.getLayerInfoFromGeoserver(worldId, layerName)
		.then(layerInfo => {
			console.log("1. got Layer Info...");
			console.log("1. worldLayer: ", JSON.stringify(worldLayer));
			worldLayer.layer = layerInfo.layer;
			worldLayer.layer.type = layerInfo.layer.type.toUpperCase();         // set the layer type
			return layerInfo.layer.resource.href;
		})
};

// 2. get the layer's details
const getLayerDetailsFromGeoserver = (worldLayer, resourceUrl) => {
	return GsLayers.getLayerDetailsFromGeoserver(resourceUrl)
		.then(layerDetails => {
			let latLonBoundingBox;
			// get the layer details data according to the layer's type
			console.log("2. got Layer Details...");
			console.log("2. worldLayer: ", JSON.stringify(worldLayer));
			if (worldLayer.layer.type.toLowerCase() === 'raster') {
				worldLayer.data = parseLayerDetails(worldLayer, layerDetails.coverage);
				console.log("getLayerDetailsFromGeoserver data: ", JSON.stringify(worldLayer.data));
				worldLayer.data.metadata = {dirName: layerDetails.coverage.metadata.entry.$};
			}
			else if (worldLayer.layer.type.toLowerCase() === 'vector') {
				worldLayer.data = parseLayerDetails(worldLayer, layerDetails.featureType);
				worldLayer.data.metadata = {recalculateBounds: layerDetails.featureType.metadata.entry.$};
			}
			else {
				res.status(500).send('ERROR: unknown layer TYPE!');
			}
			// set the data center point
			worldLayer.data.center =
				[worldLayer.data.latLonBoundingBox.minx, worldLayer.data.latLonBoundingBox.maxy];
			console.log("getLayerDetailsFromGeoserver data center: ", JSON.stringify(worldLayer.data.center));
			const centerPoint = worldLayer.data.center;
			console.log("getLayerDetailsFromGeoserver center point: ", JSON.stringify(centerPoint));

			// set the Polygon field for Ansyn
			const polygon = worldLayer.data.latLonBoundingBox;
			console.log("getLayerDetailsFromGeoserver polygon: ", JSON.stringify(polygon));
			const bbox = [polygon.minx, polygon.miny, polygon.maxx, polygon.maxy];
			const footprint = turf.bboxPolygon(bbox);
			console.log("getLayerDetailsFromGeoserver footprint: ", JSON.stringify(footprint));
			worldLayer.geoData = {centerPoint, bbox, footprint};
			console.log("getLayerDetailsFromGeoserver geoData: ", JSON.stringify(worldLayer.geoData));

			// set the store's name
			worldLayer.layer.storeName = (worldLayer.layer.storeId).split(':')[1];
			return worldLayer.data.store.href;
		})
};

// 3. get the store's data
const getStoreDataFromGeoserver = (worldLayer, storeUrl) => {
	return GsLayers.getStoreDataFromGeoserver(storeUrl)
		.then( store => {
			console.log("3. got Store Data...");
			// get the store data according to the layer's type
			let url;
			if (worldLayer.layer.type.toLowerCase() === 'raster') {
				console.log("dbLayer get RASTER data...");
				worldLayer.store = store.coverageStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.coverageStore.connectionParameters.entry.$
					}
				};
				worldLayer.filePath = store.coverageStore.url;                          // for the file path
				console.log("dbLayer RASTER url = ", worldLayer.filePath);
				worldLayer.format = store.coverageStore.type.toUpperCase();       			// set the format
			}
			else if (worldLayer.layer.type.toLowerCase() === 'vector') {
				console.log("dbLayer get VECTOR data...");
				worldLayer.store = store.dataStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.dataStore.connectionParameters.entry[0].$,
						url: store.dataStore.connectionParameters.entry[1].$
					}
				};
				worldLayer.filePath = worldLayer.store.connectionParameters.url;        // for the file path
				console.log("dbLayer VECTOR url = ", worldLayer.filePath);
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
			console.log("dbLayer filePath: ", worldLayer.filePath);
			const extension = path.substring(path.lastIndexOf('.'));
			worldLayer.fileName = `${worldLayer.store.name}${extension}`;
			console.log("dbLayer fileName: ", worldLayer.fileName);
			// return the world-layer with all the data from GeoServer
			return worldLayer;
		})
};

// delete the layer from GeoServer
const removeLayerFromGeoserver = (resourceUrl, storeUrl) => {
	// 1. delete the layer according to the resource Url
	// 2. delete the store
	return GsLayers.deleteLayerFromGeoserver(resourceUrl)
		.then(() => GsLayers.deleteLayerFromGeoserver(storeUrl));
};

// ==============
//  CREATE (add)
// ==============
// create a new layer in the DataBase(passing a new worldLayer object in the req.body)
router.post('/:worldId/:layerName', (req, res) => {
	console.log("create Layer: req.body = ", JSON.stringify(req.body));
	console.log("create Layer: worldId = ", req.params.worldId);
	createNewLayer(req.body, req.params.worldId)
		.then( newLayer => res.send(newLayer))
		.catch ( error => {
			const consoleMessage = `db LAYER: ERROR to CREATE a new Layer!: ${error}`;
			const sendMessage = `ERROR: failed to create new layer!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// ============
//  GET (find)
// ============
// get all the Layers list from the Database
router.get('/', (req, res) => {
	console.log(`db LAYER SERVER: start GET ALL Layers...`);
	dbLayerCrud.getAll()
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR in GET-ALL Layers!: ${error}`;
			const sendMessage = `ERROR: there are no layers!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// get a Layer from the Database by id
router.get('/:layerId', (req, res) => {
	console.log(`db LAYER SERVER: start GET ${req.params.layerId} Layer by id...`);
	dbLayerCrud.get({ _id: req.params.layerId })
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR in GET a LAYER!: ${error}`;
			const sendMessage = `ERROR: layer ${req.params.layerId} can't be found!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// ====================
//  GET from GEOSERVER
// ====================
// get all the World's Layers list from GeoServer
router.get('/geoserver/:worldId', (req, res) => {
	console.log(`geo LAYER SERVER: start GET ALL ${req.params.worldId} World's Layers...`);
	GsLayers.getWorldLayerListFromGeoserver(req.params.worldId)
		.then(response => res.send(response.layers.layer))
		.catch(error => {
			const consoleMessage = `db LAYER: GET-ALL from GeoServer ERROR!: ${error}`;
			const sendMessage = `ERROR: there are no layers!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// get World's Layer DATA from GeoServer
router.get('/geoserver/:worldId/:layerName', (req, res) => {
	const layerName = req.params.layerName;
	const worldLayer = {name: layerName};
	console.log(`geo LAYER SERVER: start GET ${layerName} layer DATA...`);
	// 1. get the layer's info
	getLayerInfoFromGeoserver(worldLayer, req.params.worldId, layerName)
		.then(resourceUrl => {
			// 2. get the layer's details
			return getLayerDetailsFromGeoserver(worldLayer, resourceUrl)
		})
		.then(storeUrl => {
			// 3. get the store's data
			console.log("dbLayer storeUrl: ", storeUrl);
			return getStoreDataFromGeoserver(worldLayer, storeUrl)
		})
		.then(worldLayer => res.send(worldLayer))
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR Get Layer Data From Geoserver!: ${error}`;
			const sendMessage = `ERROR: can't get Layer's Data From Geoserver!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// get Capabilities XML file - WMTS Request for display the selected layer
router.get('/geoserver/wmts/:worldId/:layerName', (req, res) => {
	const capabilitiesUrl = `${configUrl.baseUrlGeoserver}/${req.params.worldId}/${req.params.layerName}/${configParams.wmtsServiceUrl}`;
	console.log("geo LAYER SERVER: start GetCapabilities url = ", capabilitiesUrl);
	GsLayers.getCapabilitiesFromGeoserver(capabilitiesUrl)
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db LAYER: GetCapabilities ERROR!: ${error}`;
			const sendMessage = `ERROR: Capabilities XML file of ${req.params.layerName} can't be found!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// =========
//  UPDATE
// =========
// update all the Layer's fields (passing a new layer object in the req.body)
router.put('/:layerName', (req, res) => {
	console.log("db WORLD SERVER: start to UPDATE layer ", req.params.layerName);
	dbLayerCrud.update(req.body)
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db LAYER: UPDATE Layer ERROR!: ${error}`;
			const sendMessage = `ERROR: Failed to update ${req.body.name} layer!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// update a single field in the Layer (passing the new value of the field in the req.body)
router.put('/:layerId/:fieldName', (req, res) => {
	console.log("db LAYER SERVER: start to UPDATE-FIELD layer ", req.params.layerId);
	const fieldName = req.params.fieldName;
	const fieldValue = req.body['newValue'];
	const entityId = {_id: req.params.layerId };

	let updatedField = {};
	updatedField[fieldName] = fieldValue;
	let operation = 'update';
	if (Array.isArray(updatedField)) {
		operation = 'updateArray';
	}

	dbWorldCrud.updateField(entityId, updatedField, operation)
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db LAYER:  UPDATE-FIELD Layer ERROR!: ${error}`;
			const sendMessage = `ERROR: Failed to update layer id: ${req.params.layerId}!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// ==============
//  REMOVE layer
// ==============
// delete a layer from World's Layers list in the Database and from the geoserver
router.delete('/delete/:worldId/:layerId', (req, res) => {
	console.log(`db LAYER SERVER: start DELETE layer: ${req.params.layerId}`);
	// 1. find the layer in the database
	dbLayerCrud.get({ _id: req.params.layerId })
		.then(layer => {
			console.log(`dbLayers remove layer: 1. got the layer: ${layer.name}`);
			// save the layer data before remove it from the database
			let removedLayerData;
			if (layer.fileType !== 'image') {
				removedLayerData = {
					worldId: req.params.worldId,
					resourceUrl: layer.layer.resource.href,
					storeUrl: layer.data.store.href,
					type: layer.fileType
				};
			} else {
				removedLayerData = {
					worldId: req.params.worldId,
					type: layer.fileType
				};
			}
			console.log(`removedLayerData: ${JSON.stringify(removedLayerData)}`);

			// 2. remove the layer from the Layers list in the DataBase
			return dbLayerCrud.remove({ _id: req.params.layerId })
				.then(() => {
					console.log(`removeLayerById: ${req.params.layerId}`);
					return removedLayerData;
				})
		})
		.then(removedLayerData => {
			console.log(`db LAYER SERVER: 2. removed the layer from the layers list in MongoDB!`);
			// 3. remove the layer's Id from the world's layersId array
			return dbWorldCrud.get({ _id: removedLayerData.worldId })
				.then(world => {
					console.log("dbLayers remove layer: 3a. got the world: ", world.name);
					// update the layerId list (pull the layer's Id from the layersId field in the world)
					return dbWorldCrud.updateField({ _id: world._id }, { layersId: req.params.layerId }, 'removeFromArray');
				})
				.then(world => {
					console.log("dbLayers remove layer: 3b. update the world layerID array! ", JSON.stringify(world.layersId));
					if (removedLayerData.type !== 'image') {
						// 4. delete the layer from GeoServer:
						console.log("dbLayers remove layer: 4. start to delete layer from the GeoServer!");
						return removeLayerFromGeoserver(removedLayerData.resourceUrl, removedLayerData.storeUrl)
							.then(response => {
								console.log("dbLayers remove layer: 4b. deleted the store: ", removedLayerData.storeUrl);
								res.send(response);
							})
					} else {
						console.log("succeed to remove an image file!");
						res.send('succeed to remove an image file!');
					}
				})
		})
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR to REMOVE LAYER from DataBase!: ${error}`;
			const sendMessage = `ERROR: Failed to delete layer id: ${req.params.layerId}!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

module.exports = router;
