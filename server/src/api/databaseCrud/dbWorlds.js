const express = require('express');
const worldModel = require('../../database/schemas/WorldSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsWorlds  = require("../geoserverCrud/GsWorlds");

require('../../config/serverConfig')();
const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;

const router = express.Router();

const dbWorldCrud = new MongoCrud(worldModel);
const geoserverBaseUrl = `${configUrl.serverBaseUrl}/api/gsWorlds`;

// ==============
//  CREATE (add)
// ==============
// create a new world (passing a new world object in the req.body)
router.post('/:worldName', (req, res) => {
    console.log('db WORLD SERVER: start to CREATE new World: ' + req.params.worldName + ' in Geoserver');
    // 1. in GeoServer
    GsWorlds.createNewWorldOnGeoserver(req.params.worldName)
        .then( response => {
            // 2. in the DataBase
            console.log('db WORLD SERVER: start to CREATE new World in the DataBase');
            console.log('db WORLD SERVER: req.body = ' + JSON.stringify(req.body));
            console.log('db WORLD SERVER: dbWorldCrud = ' + dbWorldCrud);
            dbWorldCrud.add(req.body)
                .then( response => {
                    console.log("dbWorld: create world response: " + response);
                    res.send(response)
                })
                .catch( error => {
                    console.error("create New World in mongoDB error!", error);
                    res.status(500).send(`Failed to create ${req.params.worldName} world! :` + error);
                });
        })
        .catch( error => {
            console.error("db WORLD SERVER: CREATE WORLD error!", error);
            res.status(500).send(`Failed to create ${req.params.worldName} world! :` + error);
        });
});

// ============
//  GET (find)
// ============
// get all the Worlds from the Database
router.get('/', (req, res) => {
    console.log("db WORLD SERVER: start GET ALL Worlds...");
    dbWorldCrud.getAll()
        .then( response => res.send(response))
        .catch( error => {
            console.error("db WORLD SERVER GET-ALL error!", error);
            res.status(404).send(`there are no worlds!`);
        });
});

// get One World from the Database by its Name
router.get('/:worldName', (req, res) => {
    console.log(`db WORLD SERVER: start GET ${req.params.worldName} World...`);
    dbWorldCrud.get(req.params.worldName)
        .then( response => res.send(response))
        .catch( error => {
            console.error("db WORLD SERVER GET error!", error);
            res.status(404).send(`world ${req.params.worldName} can't be found!`);
        });
});

// =========
//  UPDATE
// =========
// update all the World's fields (passing a new world object in the req.body)
router.put('/:worldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE world " + req.params.worldName);
    console.log("UPDATE data:" + JSON.stringify(req.body));
    let oldName = req.params.worldName;
    let newName = req.body['name'];
    const layers = req.body['layers'];

    dbWorldCrud.update(req.body)
        .then( response => {
            // if the world's name was changed - update the new name in the geoserver
            if (oldName !== newName) {
                GsWorlds.updateWorldNameInGeoserver(oldName, newName, layers)
                    .then( response => res.send(response))
                    .catch((error) => {
                        console.error("db WORLD SERVER: UPDATE-FIELD error!", error);
                        res.status(404).send(`Failed to update ${req.params.worldName} world! :` + error);
                    });
            } else {
                res.send(response);
            }
        })
        .catch( error => {
            console.error("db WORLD SERVER: UPDATE error!", error);
            res.status(404).send(`Failed to update ${req.params.worldName} world! :` + error);
        });
});

// update a single field in the World (passing the world's id + layers the new value of the field in the req.body)
router.put('/:worldName/:fieldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE-FIELD world " + req.params.worldName);
    console.log("dbWorlds: UPDATE data:" + JSON.stringify(req.body));
    const worldName = req.params.worldName;
    const fieldName = req.params.fieldName;
    const fieldValue = req.body['newValue'];
    const layers = req.body['layers'];
    const entityId = { _id: req.body['_id'] };

    let updatedField = {};
    updatedField[fieldName] = fieldValue ;
    console.log("dbWorld: updatedField = " + JSON.stringify(updatedField));
    let isArray = false;
    if ( Array.isArray(updatedField)){
        isArray = true;
        console.log("dbWorld: isArray? " + isArray);
    }

    dbWorldCrud.updateField(entityId, updatedField, isArray)
        .then( response => {
            // if the world's name was changed - update the new name in the geoserver
            if (fieldName === 'name') {
                GsWorlds.updateWorldNameInGeoserver(worldName, fieldValue, layers)
                    .then(response => res.send(response))
                    .catch(error => {
                        console.error("db WORLD SERVER: UPDATE-FIELD error!", error);
                        res.status(500).send(`Failed to update ${req.params.worldName} world! :` + error);
                    });
            } else {
                res.send(response);
            }
        })
        .catch( error => {
            console.error("db WORLD SERVER: UPDATE-FIELD error!", error);
            res.status(500).send(`Failed to update ${req.params.worldName} world! :` + error);
        });

});

// =========
//  REMOVE
// =========
// delete a world
router.delete('/:worldName/:worldId', (req, res) => {
    console.log("dbWorlds: delete world params: " + req.params.worldName, req.params.worldId);
    // 1. delete the world(worlspace) from GeoServer:
    GsWorlds.deleteWorldFromGeoserver(req.params.worldName)
        .then( response => {
            // 2. delete the world from the DataBase (passing the world's id as a req.params)
            console.log('db WORLD SERVER: start to REMOVE a World from the DataBase: ' + req.params.worldId);
            dbWorldCrud.remove(req.params.worldId)
                .then( response => res.send(response))
                .catch( error => {
                    console.error("db SERVER: DELETE error!", error);
                    res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
                });
        })
        .catch( error => {
            console.error("db WORLD SERVER: DELETE error!", error);
            res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
        });
});

module.exports = router;