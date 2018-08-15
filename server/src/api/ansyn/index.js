const express = require('express');
const router = express.Router();
const layerModel = require('../../database/schemas/LayerSchema');
const worldModel = require('../../database/schemas/WorldSchema');

const findWorld = ({name}) => worldModel.findOne({name});

const findLayers = (layersId, $gte, $lte, $geometry) => {
	console.log({ $gte, $lte });
	return layerModel.find({
		$or: layersId.map((_id) => ({_id})),
		'fileData.fileCreatedDate': {$gte, $lte},
		'footprint.geometry': {$geoWithin: {$geometry}}
	});
};

const fetchLayers = (req, res) => {
	findWorld({name: req.body.worldName})
		.then((world) => {
			if (!world) {
				throw new Error('No World!');
			}
			return world;
		})
		.then((world) => {
			const layers = world.layersId,
						start = Date.parse(req.body.dates.start),
						end = Date.parse(req.body.dates.end),
						geometry = req.body.geometry;
			return findLayers(layers, start, end, geometry)
				.then((layers) => res.send(layers));
		})
		.catch((err) => {
			console.log(err);
			res.send([])
		});
};

router.post('/fetchLayers', fetchLayers);

module.exports = router;
