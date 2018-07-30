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

// ========
//  REMOVE
// ========
// delete layer from the geoserver layers's list
router.delete('/delete/:worldName/:layerId', (req, res) => {
    console.log(`db LAYER SERVER: start DELETE layer: ${req.params.layerId} from ${req.params.worldName}'s world`);
    // 1. delete the layer from GeoServer:
    GsLayers.deleteLayerFromGeoserver(req.params.worldName)
    axios.delete(`${configUrl.baseRestUrlGeoserver}/layers/${req.params.layerId}.json?recurse=true`,
        { headers: { authorization } })
        .then( response => {
            console.log(`success delete layer ${req.params.layerId}`);
            res.send(response);
        })
        .catch( error => res.send('error'));
});

// // =========
// //   REMOVE
// // =========
// // 1. delete the world(worlspace) from GeoServer:
// router.delete('/:worldName/:worldId', (req, res) => {
//     console.log("dbWorlds: delete world params: " + req.params.worldName, req.params.worldId);
//     GsWorlds.deleteWorldFromGeoserver(req.params.worldName)
//         .then( response => {
//             // 2. delete the world from the DataBase (passing the world's id as a req.params)
//             console.log('db WORLD SERVER: start to REMOVE a World from the DataBase: ' + req.params.worldId);
//             dbWorldCrud.remove(req.params.worldId)
//                 .then( response => res.send(response))
//                 .catch( error => {
//                     console.error("db SERVER: DELETE error!", error);
//                     res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
//                 });
//         })
//         .catch( error => {
//             console.error("db WORLD SERVER: DELETE error!", error);
//             res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
//         });
// });

module.exports = router;



