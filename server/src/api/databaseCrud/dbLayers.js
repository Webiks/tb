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

const updateWorldField = (_id, layersId, operation) =>
													dbWorldCrud.updateField({ _id }, { layersId }, operation );
// ===========
// L A Y E R S
// ===========
const findLayerById = (_id) => dbLayerCrud.get({ _id });

const removeLayerById = (_id) => dbLayerCrud.remove({ _id });

// parse layer
const parseLayerDetails = (worldLayer, data) => {
	console.log("parseLayerDetails data: " + JSON.stringify(data));
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
			console.log("dbLayer: Center = " + JSON.stringify(worldLayer.data.center));

			// set the Polygon field for Ansyn
			console.log("dbLayer: bbox = " + JSON.stringify(Object.values(worldLayer.data.latLonBoundingBox).filter( value => typeof value === 'number')));
			const { minx, maxx, miny, maxy } = worldLayer.data.latLonBoundingBox;
			worldLayer.footprint = turf.bboxPolygon([ minx, miny, maxx, maxy ]);
			console.log("dbLayer: Polygon = " + JSON.stringify(worldLayer.polygon));

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
				worldLayer.store = store.coverageStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.coverageStore.connectionParameters.entry.$
					}
				};
				url = store.coverageStore.url;                                          // set the file path
				worldLayer.store.format = store.coverageStore.type.toUpperCase();       // set the store format
			}
			else if (worldLayer.layer.type.toLowerCase() === 'vector') {
				worldLayer.store = store.dataStore;
				// translate map to an object
				worldLayer.store = {
					connectionParameters: {
						namespace: store.dataStore.connectionParameters.entry[0].$,
						url: store.dataStore.connectionParameters.entry[1].$
					}
				};
				url = worldLayer.store.connectionParameters.url;                        // set the file path
				worldLayer.store.format = store.dataStore.type.toUpperCase();           // set the store format
			}
			else {
				res.status(500).send('ERROR: unknown layer TYPE!');
			}
			// set the store fields
			worldLayer.store.storeId = worldLayer.layer.storeId;
			worldLayer.store.name = worldLayer.layer.storeName;
			worldLayer.store.type = worldLayer.layer.type;

			// set the file path
			// const dirPath = (configParams.uploadFilesUrl.replace(/%20/g, " ")).replace(/%2E/g, ".");
			worldLayer.layer.filePath = `${configParams.uploadFilesUrl}/${url.split(':')[1]}`;
			console.log("dbLayer: FilePath: " + worldLayer.layer.filePath);

			// set the file name and extension
			const path = worldLayer.layer.filePath;
			worldLayer.layer.fileExtension = path.substring(path.lastIndexOf('.'));
			worldLayer.layer.fileName = `${worldLayer.store.name}${worldLayer.layer.fileExtension}`;
			console.log("dbLayers: fileName: " + worldLayer.layer.fileName);

			// return the world-layer with all the data from GeoServer
			return worldLayer;
		})
		.catch( error => {
			throw new Error(`can't find the Store page!`);
		});
};

// ==============
//  CREATE (add)
// ==============
// create a new layer in the DataBase(passing a new worldLayer object in the req.body)
router.post('/:layerName', (req, res) => {
        console.log('db WORLD SERVER: start to CREATE new World in the DataBase...' + req.body.name);
        // 1. create the new layer in the Layers list and get the layer id (from mongoDB)
        dbLayerCrud.add(req.body)
            .then( newLayer => {
							// 2. add the layer Id to the layersId list in the world
							const layerId = newLayer._id;
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
										updateWorldField( world._id, world.layersId , 'updateArray')
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
    console.log("dbLayer updatedField: " + JSON.stringify(updatedField));
    let operation = 'update';
    if ( Array.isArray(updatedField)){
        operation = 'updateArray';
        console.log("dbLayer: operation: " + operation);
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
    const layerId = req.params.layerId;
    const query = { _id: layerId };
    let workspaceName;
    let resourceUrl;
    let storeUrl;
    // 1. find the layer from the database
    dbLayerCrud.get(query)
        .then ( layer => {
            console.log(`dbLayers remove layer: 1. got the layer: ${layer.name}`);
            // save the layer data before remove it from the database
            workspaceName = layer.workspaceName;
            resourceUrl = layer.layer.resource.href;
            storeUrl = layer.data.store.href;
            // 2. remove the layer from the Layers list in the DataBase
            dbLayerCrud.remove(query)
                .then ( response => {
                    console.log(`db LAYER SERVER: 2. removed the layer from the layers list in MongoDB!`);
                    // 3. remove the layer's Id from the world's layersId array
                    // a. find the world by id
                    dbWorldCrud.get({ workspaceName })
                        .then ( world => {
                            console.log("dbLayers remove layer: 3a. got the world: " + world.name);
                            // b. update the layerId list (pull the layer's Id from the layersId field in the world)
                            dbWorldCrud.updateField({ _id: world._id }, { layersId: layerId}, 'removeFromArray')
                                .then ( result => {
                                    console.log("dbLayers remove layer: 3b. update the world layerID array!" + JSON.stringify(world.layersId));
                                    // 4. delete the layer from GeoServer:
                                    console.log("dbLayers remove layer: 4. start to delete layer from the GeoServer!");
                                    // a. delete the layer according to the resource Url
                                    GsLayers.deleteLayerFromGeoserver(resourceUrl)
                                        .then ( success => {
                                            console.log("dbLayers remove layer: 4a. deleted the layer resource: " + resourceUrl);
                                            // b. delete the store
                                            GsLayers.deleteLayerFromGeoserver(storeUrl)
                                                .then ( response => {
                                                    console.log("dbLayers remove layer: 4b. deleted the store: " + storeUrl);
                                                    res.send(response);
                                                })
                                                .catch( error => {
                                                    console.error(`db LAYER: REMOVE layer's store ERROR!: ${error}`);
                                                    res.status(404).send(`layer ${layerId} can't be found!`);
                                                })
                                        })
                                        .catch( error => {
                                            console.error(`db LAYER: REMOVE layer from resource ERROR!: ${error}`);
                                            res.status(404).send(`layer ${layerId} can't be found!`);
                                        })
                                })
                                .catch( error => {
                                    console.error(`db LAYER: ERROR to update the World in DataBase!: ${error}`);
                                    res.status(500).send(`Failed to update ${workspaceName} layersId field!`);
                                })
                        })
                        .catch( error => {
                            console.error(`db LAYER: ERROR to find the World in DataBase!: ${error}`);
                            res.status(404).send(`Failed to find ${workspaceName} workspace!`);
                        })
                })
                .catch( error => {
                    console.error(`db LAYER: ERROR to REMOVE LAYER from DataBase!: ${error}`);
                    res.status(500).send(`Failed to delete layer id: ${layerId}!`);
                });
        })
        .catch( error => {
            console.error(`db LAYER: ERROR in GET LAYER from DataBase!: ${error}`);
            res.status(404).send(`Failed to find layer id: ${layerId}!`);
        });
});

module.exports = router;



