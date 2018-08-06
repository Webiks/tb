const express = require('express');

const worldModel = require('../../database/schemas/WorldSchema');
const worldLayerModel = require('../../database/schemas/WorldLayersSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsLayers  = require("../geoserverCrud/GsLayers");

const router = express.Router();

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;
const dbWorldCrud = new MongoCrud(worldModel);

// ============
//  GET (find)
// ============
// get all the World's Layers list from the Database
router.get('/:worldName', (req, res) => {
    console.log(`db LAYER SERVER: start GET ALL ${req.params.worldName} World's Layers...`);
    const query = { worldName: req.params.worldName };
    const selector = 'layers';
    dbWorldCrud.getListByQuery(query, selector)
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db LAYER: GET-ALL from DataBase ERROR!: ${error}`);
            res.status(404).send(`there are no layers!`);
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
            console.error(`db LAYER: GET-ALL from GeoServer ERROR!: ${error}`);
            res.status(404).send(`there are no layers!`);
        });
});

// get World's Layer DATA from GeoServer
router.get('/geoserver/:workspaceName/:layerName', (req, res) => {
    const layerName = req.params.layerName;
    const worldLayer = { name: layerName };
    console.log(`geo LAYER SERVER: start GET ${layerName} layer DATA...`);
    // 1. get the layer's info
    GsLayers.getLayerInfoFromGeoserver(req.params.workspaceName, layerName)
        .then( layerInfo => {
            worldLayer.layer = layerInfo.layer;
            worldLayer.worldLayerId = layerInfo.layer.resource.name;            // set the layer id
            worldLayer.layer.type = layerInfo.layer.type.toUpperCase();         // set the layer type
            return layerInfo.layer.resource.href;
        })
        .then ( resourceUrl  => {
            // 2. get the layer's details
            GsLayers.getLayerDetailsFromGeoserver(resourceUrl)
                .then ( layerDetails => {
                    // get the layer details data according to the layer's type
                    console.log("layerDetails: " + JSON.stringify(layerDetails));
                    if (worldLayer.layer.type === 'RASTER') {
                        worldLayer.data = layerDetails.coverage;
                        // translate maps to objects
                        worldLayer.data.nativeCRS =
                            layerDetails.coverage.nativeCRS.$
                                ? layerDetails.coverage.nativeCRS.$
                                : layerDetails.coverage.nativeCRS;
                        worldLayer.data.nativeBoundingBox.crs =
                            layerDetails.coverage.nativeBoundingBox.crs.$
                                ? layerDetails.coverage.nativeBoundingBox.crs.$
                                : layerDetails.coverage.nativeBoundingBox.crs;

                        worldLayer.data.metadata = {dirName: layerDetails.coverage.metadata.entry.$};
                        worldLayer.layer.storeId = layerDetails.coverage.store.name;                    // set the store's ID
                        // set the data center point
                        worldLayer.data.center =
                            [layerDetails.coverage.latLonBoundingBox.minx, layerDetails.coverage.latLonBoundingBox.maxy];
                    }
                    else if (worldLayer.layer.type === 'VECTOR') {
                        worldLayer.data = layerDetails.featureType;
                        // translate maps to objects
                        worldLayer.data.nativeCRS =
                            layerDetails.featureType.nativeCRS.$
                                ? layerDetails.featureType.nativeCRS.$
                                : layerDetails.featureType.nativeCRS;
                        worldLayer.data.nativeBoundingBox.crs =
                            layerDetails.featureType.nativeBoundingBox.crs.$
                                ? layerDetails.featureType.nativeBoundingBox.crs.$
                                : layerDetails.featureType.nativeBoundingBox.crs;

                        worldLayer.data.metadata = {recalculateBounds: layerDetails.featureType.metadata.entry.$};
                        worldLayer.layer.storeId = layerDetails.featureType.store.name;                 // set the store's ID
                        // set the data center point
                        worldLayer.data.center =
                            [layerDetails.featureType.latLonBoundingBox.minx, layerDetails.featureType.latLonBoundingBox.maxy];
                    }
                    else {
                        res.status(500).send('ERROR: unknown layer TYPE!');
                    }
                    // set the store's name
                    worldLayer.layer.storeName = (worldLayer.layer.storeId).split(':')[1];                    
                    return worldLayer.data.store.href;
                })
                .then ( storeUrl => {
                    // 3. get the store's data
                    GsLayers.getStoreDataFromGeoserver(storeUrl)
                        .then( store => {
                            // get the store data according to the layer's type
                            if (worldLayer.layer.type === 'RASTER') {
                                worldLayer.store = store.coverageStore;
                                // translate map to an object
                                worldLayer.store = {
                                    connectionParameters: {
                                        namespace: store.coverageStore.connectionParameters.entry.$
                                    }
                                };
                                worldLayer.layer.filePath = store.coverageStore.url;                    // set the file path
                                worldLayer.store.format = store.coverageStore.type.toUpperCase();       // set the store format
                            }
                            else if (worldLayer.layer.type === 'VECTOR') {
                                worldLayer.store = store.dataStore;
                                // translate map to an object
                                worldLayer.store = {
                                    connectionParameters: {
                                        namespace: store.dataStore.connectionParameters.entry[0].$,
                                        url: store.dataStore.connectionParameters.entry[1].$
                                    }
                                };
                                worldLayer.layer.filePath = worldLayer.store.connectionParameters.url;  // set the file path
                                worldLayer.store.format = store.dataStore.type.toUpperCase();           // set the store format
                            }
                            else {
                                res.status(500).send('ERROR: unknown layer TYPE!');
                            }
                            // set the store fields
                            worldLayer.store.storeId = worldLayer.layer.storeId;
                            worldLayer.store.name = worldLayer.layer.storeName;
                            worldLayer.store.type = worldLayer.layer.type;

                            // set the file name and extension
                            const path = worldLayer.layer.filePath;
                            worldLayer.layer.fileName = path.substring(path.lastIndexOf(worldLayer.store.name));
                            console.log("dbLayers: fileName: " + worldLayer.layer.fileName);
                            worldLayer.layer.fileExtension = path.substring(path.lastIndexOf('.'));

                            // return the world-layer with all the data from GeoServer
                            res.send(worldLayer)
                        })
                        .catch( error => {
                            console.error(`db LAYER: Get Store Data From Geoserver ERROR!: ${error}`);
                            res.status(404).send(`can't find the Store!`);
                        })
                })
                .catch( error => {
                    console.error(`db LAYER: Get Layer Details From Geoserver ERROR!: ${error}`);
                    res.status(404).send(`can't find the Layer's Details page!`);
                });
        })
        .catch( error => {
            console.error(`db LAYER: Get Layer Info From Geoserver ERROR!: ${error}`);
            res.status(404).send(`can't find the Layer's Info page!`);
        });
});

// get Capabilities XML file - WMTS Request for display the selected layer
router.get('/geoserver/wmts/:workspaceName/:layerName', (req, res) => {
    const capabilitiesUrl = `${configUrl.capabilitiesBaseUrl}/${req.params.workspaceName}/${req.params.layerName}/${configParams.wmtsServiceUrl}`;
    console.log("geo LAYER SERVER: start GetCapabilities url = " + capabilitiesUrl);
    GsLayers.getCapabilitiesFromGeoserver(capabilitiesUrl)
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db LAYER: GetCapabilities ERROR!: ${error}`);
            res.status(404).send(`Capabilities XML file of ${req.params.layerName} can't be found!`);
        });
});

// ==============
//  REMOVE layer
// ==============
// delete a layer from World's Layers list in the Database and from the geoserver
router.delete('/delete/:worldName/:layerId', (req, res) => {
    const worldName = req.params.worldName;
    const layerId = req.params.layerId;
    console.log(`db LAYER SERVER: start DELETE layer: ${req.params.layerId}`);
    // 1. get the selected layer from the world's layers field in the database
    console.log(`db LAYER SERVER: 1. start to FIND the layer ${req.params.layerId} in ${req.params.worldName} world`);
    const query = {
        name: worldName
    };
    const selector = {
        layers: {
            $elemMatch: { _id: layerId }
        }
    };
    dbWorldCrud.getByQuery(query, selector)
        .then( result => {
            const layer = result.layers[0];
            // 2. delete the layer from GeoServer:
            GsLayers.deleteLayerFromGeoserver(layer.layer.resource.href)
                .then ( response => {
                    // 3. delete the store
                    GsLayers.deleteLayerFromGeoserver(layer.data.store.href)
                        .then ( response => res.send(response))
                        .catch( error => {
                            console.error(`db LAYER: REMOVE layer's store ERROR!: ${error}`);
                            res.status(404).send(`layer ${req.params.layerId} can't be found!`);
                        })
                })
                .catch( error => {
                    console.error(`db LAYER: REMOVE layer from resource ERROR!: ${error}`);
                    res.status(404).send(`layer ${req.params.layerId} can't be found!`);
                })
        })
        .catch( error => {
            console.error(`db LAYER: REMOVE find-layer ERROR!: ${error}`);
            res.status(404).send(`layer ${req.params.layerId} can't be found!`);
        });
});

// ========================================= private  F U N C T I O N S ============================================
function handleError(res, consoleMessage, sendMessage){
    console.error('db LAYER: ' + consoleMessage);
    res.status(404).send(sendMessage);
}

module.exports = router;



