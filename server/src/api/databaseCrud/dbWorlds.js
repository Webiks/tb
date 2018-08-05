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
                .catch( error => handleError(res, 500, `CREATE New World in DataBase ERROR!: ${error}`, `Failed to create ${req.params.worldName} world!`))
        })
        .catch( error => handleError(res, 500, `CREATE New World in GeoServer ERROR!: ${error}`, `Failed to create ${req.params.worldName} world!`));
});

// ============
//  GET (find)
// ============
// get all the Worlds from the Database
router.get('/', (req, res) => {
    console.log("db WORLD SERVER: start GET ALL Worlds...");
    dbWorldCrud.getAll()
        .then( response => res.send(response))
        .catch( error => handleError(res, 404, `GET-ALL Worlds ERROR!: ${error}`, `there are no worlds!`));
});

// get One World from the Database by its Name
router.get('/:worldName', (req, res) => {
    console.log(`db WORLD SERVER: start GET ${req.params.worldName} World...`);
    dbWorldCrud.get({ name: req.params.worldName })
        .then( response => res.send(response))
        .catch( error => handleError(res, 404, `GET World ERROR!: ${error}`, `world ${req.params.worldName} can't be found!`));
});

// =========
//  UPDATE
// =========
// update all the World's fields (passing a new world object in the req.body)
router.put('/:worldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE world " + req.params.worldName);
    let oldName = req.params.worldName;
    let newName = req.body['name'];
    const layers = req.body['layers'];

    dbWorldCrud.update(req.body)
        .then( response =>  res.send(response))
        .catch( error => handleError(res, 500, `UPDATE World ERROR!: ${error}`, `Failed to update ${req.params.worldName} world!`));
});

// update a single field in the World (passing the world's id + layers the new value of the field in the req.body)
router.put('/:worldName/:fieldName', (req, res) => {
    console.log("db WORLD SERVER: start to UPDATE-FIELD world " + req.params.worldName);
    const worldName = req.params.worldName;
    const fieldName = req.params.fieldName;
    const fieldValue = req.body['newValue'];
    const layers = req.body['layers'];
    const entityId = { _id: req.body['_id'] };

    let updatedField = {};
    updatedField[fieldName] = fieldValue ;
    let operation = 'update';
    if ( Array.isArray(updatedField)){
        operation = 'updateArray';
        console.log("dbWorld: operation: " + operation);
    }

    dbWorldCrud.updateField(entityId, updatedField, operation)
        .then( response => res.send(response))
        .catch( error => handleError(res, 500, ` UPDATE-FIELD World ERROR!: ${error}`, `Failed to update ${req.params.worldName} world!`));
});

// =========
//  REMOVE
// =========
// delete a world
router.delete('/delete/:geoserverName/:worldId', (req, res) => {
    console.log("dbWorlds: delete world params: " + req.params.geoserverName + ", id: " + req.params.worldId);
    // 1. delete the world(workspace) from GeoServer:
    GsWorlds.deleteWorldFromGeoserver(req.params.geoserverName)
        .then( response => {
            // 2. delete the world from the DataBase (passing the world's id as a req.params)
            console.log('db WORLD SERVER: start to REMOVE a World from the DataBase: ' + req.params.worldId);
            dbWorldCrud.remove({ _id: req.params.worldId })
                .then( response => res.send(response))
                .catch( error => handleError(res, 404, ` DELETE World from DataBase ERROR!: ${error}`, `Failed to delete ${req.params.geoserverName} world!`))
        })
        .catch( error => handleError(res, 404, ` DELETE Workspace from GeoServer ERROR!: ${error}`, `Failed to delete ${req.params.geoserverName} worksapce!`));
});

// ========================================= private  F U N C T I O N S ============================================
handleError = (res, status, consoleMessage, sendMessage) => {
    console.error('db WORLD: ' + consoleMessage);
    res.status(status).send(sendMessage);
};

module.exports = router;