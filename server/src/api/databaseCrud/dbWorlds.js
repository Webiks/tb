const express = require('express');
const worldModel = require('../../database/schemas/WorldSchema');
const layerModel = require('../../database/schemas/LayerSchema');
const MongoCrud = require('../../database/MongoCrud');
const GsWorlds = require('../geoserverCrud/GsWorlds');

const router = express.Router();

const dbWorldCrud = new MongoCrud(worldModel);
const dbLayerCrud = new MongoCrud(layerModel);

const handleError = (res, status, consoleMessage, sendMessage) => {
	console.error('db WORLD: ' + consoleMessage);
	res.status(status).send(sendMessage);
};

// ==============
//  CREATE (add)
// ==============
// create a new world (passing a new world object in the req.body)
router.post('/:worldName', (req, res) => {
	const world = req.body;
	world._id = req.params.worldName;
	console.log('db WORLD SERVER: start to CREATE new World: ' + world._id + ' in Geoserver');
	// 1. in GeoServer
	GsWorlds.createNewWorldOnGeoserver(world._id)
		.then(response => {
			// 2. in the DataBase
			console.log('db WORLD SERVER: start to CREATE new World in the DataBase...');
			dbWorldCrud.add(world)
				.then(response => res.send(response));
		})
		.catch(error => {
			const consoleMessage = `db WORLD: ERROR in CREATE a New World in GeoServer!: ${error}`;
			const sendMessage = `ERROR: Failed to create ${req.params.worldName} world!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// ============
//  GET (find)
// ============
// get all the Worlds from the Database
router.get('/', (req, res) => {
	console.log('db WORLD SERVER: start GET ALL Worlds...');
	dbWorldCrud.getAll()
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db WORLD: ERROR in GET-ALL Worlds!: ${error}`;
			const sendMessage = `ERROR in GET-ALL Worlds!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// get One World from the Database by its Name
router.get('/:worldId', (req, res) => {
	console.log(`db WORLD SERVER: start GET ${req.params.worldId} World by id...`);
	dbWorldCrud.get({ _id: req.params.worldId })
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db WORLD: ERROR in GET the World!: ${error}`;
			const sendMessage = `ERROR: world ${req.params.worldId} can't be found!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

// =========
//  UPDATE
// =========
// update all the World's fields (passing a new world object in the req.body)
router.put('/:worldName', (req, res) => {
	console.log('db WORLD SERVER: start to UPDATE world ' + req.params.worldName);
	dbWorldCrud.update(req.body)
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db WORLD: ERROR in UPDATE the World!: ${error}`;
			const sendMessage = `ERROR: Failed to update ${req.params.worldName} world!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// update a single field in the World (passing the world's id + layers the new value of the field in the req.body)
router.put('/:worldName/:fieldName', (req, res) => {
	console.log('db WORLD SERVER: start to UPDATE-FIELD world ' + req.params.worldName);
	const fieldName = req.params.fieldName;
	const fieldValue = req.body['newValue'];
	const entityId = { _id: req.body['_id'] };

	let updatedField = {};
	updatedField[fieldName] = fieldValue;
	console.log('dbWorld updatedField: ' + JSON.stringify(updatedField));
	let operation = 'update';
	if (Array.isArray(updatedField)) {
		operation = 'updateArray';
	}

	dbWorldCrud.updateField(entityId, updatedField, operation)
		.then(response => res.send(response))
		.catch(error => {
			const consoleMessage = `db WORLD: ERROR in UPDATE-FIELD the World!: ${error}`;
			const sendMessage = `ERROR: Failed to update ${req.params.worldName} world!: ${error}`;
			handleError(res, 500, consoleMessage, sendMessage);
		});
});

// =========
//  REMOVE
// =========
// delete a world
router.delete('/delete/:worldId', (req, res) => {
	console.log('dbWorlds: delete world id: ' + req.params.worldId);
	// 1. delete the world(workspace) from GeoServer:
	GsWorlds.deleteWorldFromGeoserver(req.params.worldId)
		.then(response => {
			// 2. get the world
			dbWorldCrud.get({ _id: req.params.worldId })
				.then(world => {
					// 3. remove the world's layers from the DataBase
					dbLayerCrud.remove({ $or: world.layersId.map((_id) => ({ _id })) });
				})
				.then(() => {
					// 4. delete the world from the DataBase
					dbWorldCrud.remove({ _id: req.params.worldId })
						.then((layers) => res.send(layers));
				});
		})
		.catch((error) => {
			const consoleMessage = `db WORLD: ERROR in DELETE World from GeoServer!: ${error}`;
			const sendMessage = `ERROR: Failed to delete ${req.params.geoserverName} world from GeoServer!: ${error}`;
			handleError(res, 404, consoleMessage, sendMessage);
		});
});

module.exports = router;
