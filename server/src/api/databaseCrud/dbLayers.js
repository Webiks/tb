const express = require('express');
const turf = require('@turf/turf');
const router = express.Router();

const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsLayers  = require("../geoserverCrud/GsLayers");

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

// ============== F U N C T I O N ======================
// ===========
// E R R O R S
// ===========
const handleError = (res, status, consoleMessage, sendMessage) => {
	console.error('db Layer: ' + consoleMessage);
	res.status(status).send(sendMessage);
};

// ==========
// W O R L D
// ==========
const findWorldById = (_id) => dbWorldCrud.get({ _id });

const findWorldByWorkspaceName = (workspaceName) => dbWorldCrud.get({ workspaceName });

const updateWorldLayersId = (_id, layerId, operation) =>
													dbWorldCrud.updateField({ _id }, { layersId : layerId }, operation );
// ===========
// L A Y E R S
// ===========
const findLayerById = (_id) => dbLayerCrud.get({ _id });

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
const getLayerInfoFromGeoserver  = (worldLayer, workspaceName, layerName) => {
	return GsLayers.getLayerInfoFromGeoserver(workspaceName, layerName)
		.then( layerInfo => {
			console.log("1. got Layer Info...");
			worldLayer.layer = layerInfo.layer;
			worldLayer.worldLayerId = layerInfo.layer.resource.name;            // set the layer id
			worldLayer.layer.type = layerInfo.layer.type.toUpperCase();         // set the layer type
			return layerInfo.layer.resource.href;
		})
		.catch( error => {
			throw new Error(`can't find the Layer's Info page!`);
		});
};

// 2. get the layer's details
const getLayerDetailsFromGeoserver  = (worldLayer, resourceUrl) => {
	return GsLayers.getLayerDetailsFromGeoserver(resourceUrl)
		.then ( layerDetails => {
			let latLonBoundingBox;
			// get the layer details data according to the layer's type
			console.log("2. got Layer Details...");
			if (worldLayer.layer.type.toLowerCase() === 'raster') {
				worldLayer.data = parseLayerDetails(worldLayer, layerDetails.coverage);
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

			// set the Polygon field for Ansyn
			const { minx, maxx, miny, maxy } = worldLayer.data.latLonBoundingBox;
			worldLayer.footprint = turf.bboxPolygon([ minx, miny, maxx, maxy ]);

			// set the store's name
			worldLayer.layer.storeName = (worldLayer.layer.storeId).split(':')[1];
			return worldLayer.data.store.href;
		})
		.catch( error => {
			throw new Error(`can't find the Layer's Details page!`);
		});
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
				url = store.coverageStore.url;                                          // for the file path
				worldLayer.store.format = store.coverageStore.type.toUpperCase();       // set the store format
				console.log("dbLayer url = " + url);
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
				url = worldLayer.store.connectionParameters.url;                        // for the file path
				worldLayer.store.format = store.dataStore.type.toUpperCase();           // set the store format
			}
			else {
				res.status(500).send('ERROR: unknown layer TYPE!');
			}
			// set the store fields
			worldLayer.store.storeId = worldLayer.layer.storeId;
			worldLayer.store.name = worldLayer.layer.storeName;
			worldLayer.store.type = worldLayer.layer.type;
			console.log("dbLayer store data: " + worldLayer.store.storeId + ', ' + worldLayer.store.type);

			// set the file path
			worldLayer.filePath = `${configParams.uploadFilesUrl}/${url.split(':')[1]}`;

			// set the file name
			const path = worldLayer.filePath;
			const extension = path.substring(path.lastIndexOf('.'));
			worldLayer.fileName = `${worldLayer.store.name}${extension}`;
			console.log("dbLayer fileName: " + worldLayer.fileName);
			// return the world-layer with all the data from GeoServer
			return worldLayer;
		})
		.catch( error => {
			throw new Error(`can't find the Store page!`);
		});
};

const removeLayerById = (_id) => dbLayerCrud.remove({ _id });

// delete the layer from GeoServer
const removeLayerFromGeoserver = (resourceUrl, storeUrl) => {
	// 1. delete the layer according to the resource Url
	return GsLayers.deleteLayerFromGeoserver(resourceUrl)
		.then ( success => {
			console.log("dbLayers remove layer: 4a. deleted the layer resource: " + resourceUrl);
			// 2. delete the store
			return GsLayers.deleteLayerFromGeoserver(storeUrl)
		})
		.catch( error => {
			throw new Error(`can't delete layer from geoserver!`);
		});
};

// ==============
//  CREATE (add)
// ==============
// create a new layer in the DataBase(passing a new worldLayer object in the req.body)
router.post('/:layerName', (req, res) => {
        console.log('db LAYER SERVER: start to CREATE new Layer in the DataBase...' + req.body.name);
        // 1. create the new layer in the Layers list and get the layer id (from mongoDB)
        dbLayerCrud.add(req.body)
            .then( newLayer => {
							// 2. add the layer Id to the layersId list in the world
							return findWorldByWorkspaceName(req.body.workspaceName)
								.then(world => {
									if (!world) {
										throw new Error('No Workspace!');
									}
									return world;
								})
								.then ( world => {
										console.log("dbLayers create layer: a. got the world: " + world.name);
										// update the layerId list (push the new layer's Id)
									updateWorldLayersId( world._id, newLayer._id , 'updateArray')
												.then ( updateWorld => {
														console.log("dbLayers create layer: b. update the world layersId: " + newLayer.id);
														res.send(newLayer);
												})
												.catch( error => {
													const consoleMessage = `db LAYER: ERROR to update the World in DataBase!: ${error}`;
													const sendMessage = `Failed to update ${req.body.workspaceName} layersId field!`;
													handleError(res, 500, consoleMessage, sendMessage);
												})
								})
								.catch( error => {
										console.error(`db LAYER: ERROR to find the World in DataBase!: ${error}`);
										res.status(404).send(`Failed to find ${req.body.workspaceName} workspace!`);
								})
            })
            .catch( error => {
							const consoleMessage = `db LAYER: ERROR to CREATE New LAYER in DataBase!: ${error}`;
							const sendMessage = `Failed to create ${req.params.layerName} layer!`;
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
        .then( response => res.send(response))
        .catch( error => {
					const consoleMessage = `db LAYER: ERROR in GET-ALL Layers!: ${error}`;
					const sendMessage = `there are no layers!`;
					handleError(res, 404, consoleMessage, sendMessage);
        });
});

// get a Layer from the Database by id
router.get('/:layerId', (req, res) => {
    console.log(`db LAYER SERVER: start GET ${req.params.layerId} Layer by id...`);
		findLayerById(req.params.layerId)
        .then( response => res.send(response))
        .catch( error => {
					const consoleMessage = `db LAYER: ERROR in GET a LAYER!: ${error}`;
					const sendMessage = `layer ${req.params.layerId} can't be found!`;
					handleError(res, 404, consoleMessage, sendMessage);
        });
});

// ====================
//  GET from GEOSERVER
// ====================
// get all the World's Layers list from GeoServer
router.get('/geoserver/:workspaceName', (req, res) => {
    console.log(`geo LAYER SERVER: start GET ALL ${req.params.workspaceName} World's Layers...`);
    GsLayers.getWorldLayerListFromGeoserver(req.params.workspaceName)
        .then( response => res.send(response.layers.layer))
        .catch( error => {
					const consoleMessage = `db LAYER: GET-ALL from GeoServer ERROR!: ${error}`;
					const sendMessage = `there are no layers!`;
					handleError(res, 404, consoleMessage, sendMessage);
        });
});

// get World's Layer DATA from GeoServer
router.get('/geoserver/:workspaceName/:layerName', (req, res) => {
    const layerName = req.params.layerName;
    const worldLayer = { name: layerName };
    console.log(`geo LAYER SERVER: start GET ${layerName} layer DATA...`);
    // 1. get the layer's info
		getLayerInfoFromGeoserver(worldLayer, req.params.workspaceName, layerName)
        .then ( resourceUrl  => {
					// 2. get the layer's details
					return getLayerDetailsFromGeoserver(worldLayer, resourceUrl)
				})
				.then ( storeUrl => {
					// 3. get the store's data
					console.log("dbLayer storeUrl: " + storeUrl);
					return getStoreDataFromGeoserver(worldLayer, storeUrl)
				})
				.then( worldLayer => res.send(worldLayer))
        .catch( error => {
					const consoleMessage = `db LAYER: ERROR Get Layer Data From Geoserver!: ${error}`;
					const sendMessage = `can't get Layer's Data From Geoserver!`;
					handleError(res, 404, consoleMessage, sendMessage);
        });
});

// get Capabilities XML file - WMTS Request for display the selected layer
router.get('/geoserver/wmts/:workspaceName/:layerName', (req, res) => {
    const capabilitiesUrl = `${configUrl.baseUrlGeoserver}/${req.params.workspaceName}/${req.params.layerName}/${configParams.wmtsServiceUrl}`;
    console.log("geo LAYER SERVER: start GetCapabilities url = " + capabilitiesUrl);
    GsLayers.getCapabilitiesFromGeoserver(capabilitiesUrl)
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db LAYER: GetCapabilities ERROR!: ${error}`);
            res.status(404).send(`Capabilities XML file of ${req.params.layerName} can't be found!`);
        });
});

// =========
//  UPDATE
// =========
// update all the Layer's fields (passing a new layer object in the req.body)
router.put('/:layerName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE layer " + req.params.layerName);
    dbLayerCrud.update(req.body)
        .then( response =>  res.send(response))
        .catch( error => {
            console.error(`db LAYER: UPDATE Layer ERROR!: ${error}`);
            res.status(500).send(`Failed to update ${req.body.name} layer!`);
        });
});

// update a single field in the Layer (passing the new value of the field in the req.body)
router.put('/:layerId/:fieldName', (req, res) => {
    console.log("db LAYER SERVER: start to UPDATE-FIELD layer " + req.params.layerId);
    const fieldName = req.params.fieldName;
    const fieldValue = req.body['newValue'];
    const entityId = { _id: req.params.layerId };

    let updatedField = {};
    updatedField[fieldName] = fieldValue ;
    let operation = 'update';
    if ( Array.isArray(updatedField)){
        operation = 'updateArray';
    }

    dbWorldCrud.updateField(entityId, updatedField, operation)
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db LAYER: UPDATE-FIELD Layer ERROR!: ${error}`);
            res.status(500).send(`Failed to update layer id: ${req.params.layerId}!`);
        });
});

// ==============
//  REMOVE layer
// ==============
// delete a layer from World's Layers list in the Database and from the geoserver
router.delete('/delete/:layerId', (req, res) => {
	console.log(`db LAYER SERVER: start DELETE layer: ${req.params.layerId}`);
	// 1. find the layer from the database
	findLayerById(req.params.layerId)
        .then ( layer => {
					console.log(`dbLayers remove layer: 1. got the layer: ${layer.name}`);
					// save the layer data before remove it from the database
					const removedLayerData = {
						workspaceName: layer.workspaceName,
						resourceUrl: layer.layer.resource.href,
						storeUrl: layer.data.store.href
					};
					// 2. remove the layer from the Layers list in the DataBase
					return removeLayerById(req.params.layerId)
						.then ( response => removedLayerData )
						.catch( error => {
							throw new Error(`can't find the layer!`);
						});
				})
				.then ( removedLayerData => {
					console.log(`db LAYER SERVER: 2. removed the layer from the layers list in MongoDB!`);
					// 3. remove the layer's Id from the world's layersId array
					return findWorldByWorkspaceName(removedLayerData.workspaceName)
						.then ( world => {
							console.log("dbLayers remove layer: 3a. got the world: " + world.name);
							// update the layerId list (pull the layer's Id from the layersId field in the world)
							return updateWorldLayersId(world._id, req.params.layerId, 'removeFromArray');
						})
						.then ( world => {
							console.log("dbLayers remove layer: 3b. update the world layerID array!" + JSON.stringify(world.layersId));
							// 4. delete the layer from GeoServer:
							console.log("dbLayers remove layer: 4. start to delete layer from the GeoServer!");
							return removeLayerFromGeoserver(removedLayerData.resourceUrl, removedLayerData.storeUrl)
								.then( response => {
									console.log("dbLayers remove layer: 4b. deleted the store: " + removedLayerData.storeUrl);
									res.send(response);
								})
								.catch(error => {
									const consoleMessage = `db LAYER: REMOVE layer's store ERROR!: ${error}`;
									const sendMessage = `layer ${req.params.layerId} can't be found!`;
									handleError(res, 404, consoleMessage, sendMessage);
								})
						})
						.catch( error => {
							const consoleMessage = `db LAYER: ERROR to find the World in DataBase!: ${error}`;
							const sendMessage = `Failed to find ${removedLayerData.workspaceName} workspace!`;
							handleError(res, 404, consoleMessage, sendMessage);
						})
				})
				.catch( error => {
					const consoleMessage = `db LAYER: ERROR to REMOVE LAYER from DataBase!: ${error}`;
					const sendMessage = `Failed to delete layer id: ${req.params.layerId}!`;
					handleError(res, 500, consoleMessage, sendMessage);
				});
});

module.exports = router;



