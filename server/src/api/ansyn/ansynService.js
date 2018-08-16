const express = require('express');
const router = express.Router();
const layerModel = require('../../database/schemas/LayerSchema');
const worldModel = require('../../database/schemas/WorldSchema');

const findWorld = ({name}) => worldModel.findOne({name});

const addTimeZoneToDate = (date, timeZone) => {
	if ( date.endsWith('Z') ){
		// change the time zone to be like the giving one
		date = date.substr(0,date.indexOf('.') + 1);
	}
	console.log(`addTimeZoneToDate: ${date}${timeZone}`);
	// return the date as a number
	return Date.parse(`${date}${timeZone}`);
};

const findLayers = (layersId, start, end, $geometry) => {
	console.log("before:" + JSON.stringify({ start, end }));
	// find the world layers that are whitin the giving polygon
	return layerModel.find({
		$or: layersId.map((_id) => ({_id})),
		'footprint.geometry': {$geoWithin: {$geometry}}
		})
		.then ( layers => {
			const matchLayers = layers.map ( layer => {
				console.log("date: " + layer.fileData.fileCreatedDate);
				const subDate = layer.fileData.fileCreatedDate.substr(layer.fileData.fileCreatedDate.indexOf('.'));
				console.log("subDate: " + subDate);
				const timeZone = subDate;
				start = addTimeZoneToDate(start, timeZone);
				end = addTimeZoneToDate(end, timeZone);
				console.log("after:" + JSON.stringify({ start, end }));
				if ( layer.fileData.lastModified >= start && layer.fileData.lastModified <= end ){
					return layer;
				}
			});
			if (matchLayers) {
				return matchLayers
			} else {
				return [];
			}
		})
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
						start = req.body.dates.start,
						end = req.body.dates.end,
						geometry = req.body.geometry;
			return findLayers(layers, start, end, geometry)
				.then((layers) => res.send(layers));
		})
		.catch((err) => {
			console.log(err);
			res.send([])
		});
};

router.post('/ansynService', fetchLayers);

module.exports = router;
