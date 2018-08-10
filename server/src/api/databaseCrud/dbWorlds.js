const express = require('express');
const worldModel = require('../../database/schemas/WorldSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsWorlds  = require("../geoserverCrud/GsWorlds");

const router = express.Router();

const dbWorldCrud = new MongoCrud(worldModel);

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
            console.log('db WORLD SERVER: start to CREATE new World in the DataBase...');
            dbWorldCrud.add(req.body)
                .then( response => res.send(response))
                .catch( error => {
                    console.error(`db WORLD: ERROR in CREATE New World in DataBase!: ${error}`);
                    res.status(500).send(`Failed to create ${req.params.worldName} world!`);
                })
        })
        .catch( error => {
            console.error(`db WORLD: CREATE New World in GeoServer ERROR!: ${error}`);
            res.status(500).send(`Failed to create ${req.params.worldName} world!`);
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
            console.error(`db WORLD: ERROR in GET-ALL Worlds!: ${error}`);
            res.status(404).send(`there are no worlds!`);
        });
});

// get One World from the Database by its Name
router.get('/:worldId', (req, res) => {
    console.log(`db WORLD SERVER: start GET ${req.params.worldId} World by id...`);
    dbWorldCrud.get({ _id: req.params.worldId })
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db WORLD: ERROR in GET the World!: ${error}`);
            res.status(404).send(`world ${req.params.worldId} can't be found!`);
        });
});

// =========
//  UPDATE
// =========
// update all the World's fields (passing a new world object in the req.body)
router.put('/:worldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE world " + req.params.worldName);
    dbWorldCrud.update(req.body)
        .then( response =>  res.send(response))
        .catch( error => {
            console.error(`db WORLD: UPDATE World ERROR!: ${error}`);
            res.status(500).send(`Failed to update ${req.params.worldName} world!`);
        });
});

// update a single field in the World (passing the world's id + layers the new value of the field in the req.body)
router.put('/:worldName/:fieldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE-FIELD world " + req.params.worldName);
    const fieldName = req.params.fieldName;
    const fieldValue = req.body['newValue'];
    const entityId = { _id: req.body['_id'] };

    let updatedField = {};
    updatedField[fieldName] = fieldValue ;
    console.log("dbWorld updatedField: " + JSON.stringify(updatedField));
    let operation = 'update';
    if ( Array.isArray(updatedField)){
        operation = 'updateArray';
    }

    dbWorldCrud.updateField(entityId, updatedField, operation)
        .then( response => res.send(response))
        .catch( error => {
            console.error(`db WORLD: UPDATE-FIELD World ERROR!: ${error}`);
            res.status(500).send(`Failed to update ${req.params.worldName} world!`);
        });
});

// =========
//  REMOVE
// =========
// delete a world
router.delete('/delete/:workspaceName/:worldId', (req, res) => {
    console.log("dbWorlds: delete world params: " + req.params.workspaceName + ", id: " + req.params.worldId);
    // 1. delete the world(workspace) from GeoServer:
    GsWorlds.deleteWorldFromGeoserver(req.params.workspaceName)
        .then( response => {
            // 2. delete the world from the DataBase (passing the world's id as a req.params)
            console.log('db WORLD SERVER: start to REMOVE a World from the DataBase: ' + req.params.worldId);
            dbWorldCrud.remove({ _id: req.params.worldId })
                .then( response => res.send(response))
                .catch( error => {
                    console.error(`db WORLD: DELETE World from DataBase ERROR!: ${error}`);
                    res.status(404).send(`Failed to delete ${req.params.geoserverName} world!`);
                })
        })
        .catch( error => {
            console.error(`db WORLD: DELETE Workspace from GeoServer ERROR!: ${error}`);
            res.status(404).send(`Failed to delete ${req.params.workspaceName} worksapce!`);
        });
});

// ========================================= private  F U N C T I O N S ============================================
function handleError(res, status, consoleMessage, sendMessage){
    console.error('db WORLD: ' + consoleMessage);
    res.status(status).send(sendMessage);
}

module.exports = router;