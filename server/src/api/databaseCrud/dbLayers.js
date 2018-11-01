const express = require('express');
const router = express.Router();

const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const dbUtils = require('./dbUtils');
const gsUtils = require('../geoserverCrud/gsUtils');
const GsLayers = require('../geoserverCrud/GsLayers');
const createNewLayer = require('./createNewLayer');

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);


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
			dbUtils.handleError(res, 500, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 404, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 404, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 404, consoleMessage, sendMessage);
		});
});

// get World's Layer DATA from GeoServer
router.get('/geoserver/:worldId/:layerName', (req, res) => {
	const layerName = req.params.layerName;
	const worldLayer = {name: layerName};
	console.log(`geo LAYER SERVER: start GET ${layerName} layer DATA...`);
	// 1. get the layer's info
	gsUtils.getLayerInfoFromGeoserver(worldLayer, req.params.worldId, layerName)
		.then(resourceUrl => {
			// 2. get the layer's details
			return gsUtils.getLayerDetailsFromGeoserver(worldLayer, resourceUrl)
		})
		.then(storeUrl => {
			// 3. get the store's data
			console.log("dbLayer storeUrl: ", storeUrl);
			return gsUtils.getStoreDataFromGeoserver(worldLayer, storeUrl)
		})
		.then(worldLayer => res.send(worldLayer))
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR Get Layer Data From Geoserver!: ${error}`;
			const sendMessage = `ERROR: can't get Layer's Data From Geoserver!: ${error}`;
			dbUtils.handleError(res, 404, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 404, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 500, consoleMessage, sendMessage);
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
			dbUtils.handleError(res, 500, consoleMessage, sendMessage);
		});
});

// ==============
//  REMOVE layer
// ==============
// delete a layer from World's Layers list in the Database and from the geoserver
router.delete('/delete/:worldId/:layerId', (req, res) => {
	console.log(`db LAYER SERVER: start DELETE layer: ${req.params.layerId}`);
	const layerId = req.params.layerId;
	const worldId = req.params.worldId;
	// 1. remove the layer's Id from the world's layersId array
	dbWorldCrud.updateField({ _id: worldId }, { layersId: layerId }, 'removeFromArray')
		.then (() => {
			// 2. remove the layer if it doesn't exist in another worlds
			return dbUtils.removeLayer(layerId, worldId)
				.then( response => res.send(response));
		})
		.catch(error => {
			const consoleMessage = `db LAYER: ERROR to REMOVE LAYER!: ${error}`;
			const sendMessage = `ERROR: Failed to delete layer id: ${layerId}!: ${error}`;
			dbUtils.handleError(res, 500, consoleMessage, sendMessage);
		});
});

module.exports = router;

