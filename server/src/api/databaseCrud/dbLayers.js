const express = require('express');
const axios = require('axios');
const worldModel = require('../../database/schemas/WorldSchema');
const worldLayerModel = require('../../database/schemas/WorldLayersSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsWorlds  = require("../geoserverCrud/GsWorlds");
const GsLayers  = require("../geoserverCrud/gsLayers");

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;
const authorization = configParams.headers.authorization;

const router = express.Router();

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(worldLayerModel);
const geoserverBaseUrl = `${configUrl.serverBaseUrl}/api/gsLayers`;

// ==============
//  CREATE (add)
// ==============
// create a new worldLayer (passing a new worldLayer object in the req.body)
router.post('/:worldLayerId', (req, res) => {
    console.log('db WORLD SERVER: start to CREATE new WorldLayer: ' + req.params.worldLayerId + ' in the DataBase');
    console.log('db WORLD SERVER: req.body = ' + JSON.stringify(req.body));
    console.log('db WORLD SERVER: dbLayerdCrud = ' + dbLayerCrud);
    dbLayerCrud.add(req.body)
        .then( response => {
            console.log("dbWorld: create worldLyaer response: " + response);
            res.send(response)
        })
        .catch( error => {
            console.error("create New WorldLayer in mongoDB error!", error);
            res.status(500).send(`Failed to create ${req.params.worldLayerId} layer! :` + error);
        });
});

// ============
//  GET (find)
// ============
// get all the World's Layers from the Database
router.get('/:worldName', (req, res) => {
    console.log(`db LAYER SERVER: start GET ALL ${req.params.worldName} World's Layers...`);
    const query = { worldName: req.params.worldName };
    dbLayerCrud.getListByQuery(query)
        .then( response => res.send(response))
        .catch( error => {
            console.error("db LAYER SERVER GET-ALL error!", error);
            res.status(404).send(`there are no layers!`);
        });
});

// get one Layer Data from GeoServer
router.get('/:worldLayerId', (req, res) => {
    console.log("db LAYER SERVER: start GET a layer: " + req.params.worldLayerId);
    const query = { worldLayerId: req.params.worldLayerId };
    dbLayerCrud.get(query)
        .then( response => res.send(response))
        .catch( error => {
            console.error("db LAYER SERVER GET-ONE error!", error);
            res.status(404).send(`layer ${req.params.worldLayerId} can't be found!`);
        });
});

// ===============
// DELETE Requests
// ===============
// delete layer from the geoserver layers's list
router.delete('/delete/:layerId', (req, res) => {
    console.log("TB SERVER: DELETE LAYER = " + req.params.layerId);
    axios.delete(`${configUrl.baseRestUrlGeoserver}/layers/${req.params.layerId}.json?recurse=true`,
        { headers: { authorization } })
        .then( response => {
            console.log(`success delete layer ${req.params.layerId}`);
            res.send(response);
        })
        .catch( error => res.send('error'));
});

// delete layer from geoserver store - using the resource URL
router.delete('/delete/:worldName/:layerName', (req, res) => {
    // get the resource URL
    console.log(`DELETE: find the url:${configUrl.baseUrlAppGetLayer}/${req.params.worldName}/${req.params.layerName}` );
    axios.get(`${configUrl.baseUrlAppGetLayer}/${req.params.worldName}/${req.params.layerName}`)
        .then( response => {
            console.log("TB SERVER: DELETE LAYER from STORE = " + response.data.layer.resource.href);
            // delete the layer from the store
            axios.delete(`${response.data.layer.resource.href}?recurse=true`, { headers: { authorization } })
                .then( response => {
                    console.log(`success delete layer ${req.params.layerName} from store`);
                    res.send(response);
                })
                .catch( error => res.send('error'));
        })
        .catch( error => {
            console.error(`deleteLayerFromStore ERROR!: ${error}`);
            res.status(404).send(`layer ${req.params.layerName}'s resource Href can't be found!`);
        });
});

router.delete('/delete/store/:worldName/:storeName/:storeType', (req, res) => {
    const storeType = (getTypeData(req.params.storeType)).storeType;
    const storeUrl =
        `${configUrl.baseWorkspacesUrlGeoserver}/${req.params.worldName}/${storeType}/${req.params.storeName}.json?recurse=true`;
    console.log("TB SERVER: DELETE STORE = " + storeUrl);
    axios.delete(storeUrl, { headers: { authorization } })
        .then( response => {
            console.log(`success delete store ${req.params.storeName}`);
            res.send(response);
        })
        .catch( error => res.send('error'));
});

// =============================================== private  F U N C T I O N S ======================================================
function getTypeData(storeType){
    const typeData = {};
    switch (storeType) {
        case ('RASTER'):
            typeData.storeType = 'coveragestores';
            typeData.layerDetailsType = 'coverages';
            break;
        case ('VECTOR'):
            typeData.storeType = 'datastores';
            typeData.layerDetailsType = 'featuretypes';
            break;
    }
    return typeData;
}

module.exports = router;



