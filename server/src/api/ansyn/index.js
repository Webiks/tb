const express = require('express');
const router = express.Router();
const layerModel = require('../../database/schemas/LayerSchema');
const worldModel = require('../../database/schemas/WorldSchema');

router.post('/fetchLayers', (req, res) => {
    const {worldName, geometry, dates} = req.body;
    console.log(worldName, geometry, dates);
    const {start, end} = dates;
    const startDate = Date.parse(start);
    const endDate = Date.parse(end);
    console.log(startDate + ', ' + endDate);

    // 1. find the world
    const worldObject = worldModel.findOne({name: worldName}, (err, world) => {
        if (err || !world) {
            res.send([])
        } else {
            console.log('1. found the world: ' + world._id);
            // 2. find all the world's layers by Id
            const {layersId} = world;
            console.log('layersId[0]: ' + layersId[0]);
            const query = {
                $or: layersId.map((id) => ({_id: id}))
            };
            layerModel.find(query, (err, layers) => {
                if (err || !layers) {
                    res.send([]);
                } else {
                    console.log('2. found the layers IDs list! length: ' + layers.length);
                    // 3. find only the layers that are in between the giving dates
                    console.log("layers[0] date= " + layers[0].date.getTime());
                    const query = {
                        date: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    };
                    layerModel.find(query, (err, layers) => {
                        if (err || !layers) {
                            res.send([]);
                        } else {
                            console.log('3. found the match layers by Dates! length: ' + layers.length);
                            // 4. find only the layers that their footprint polygon is inside the giving geometry
                            console.log("layers[0] Geometry= " + layers[0].footprint.geometry);
                            const query = {
                                'footprint.geometry': {
                                        $geoWithin: {$geometry: geometry}
                                    }
                            };
                            layerModel.find(query, (err, layers) => {
                                if (err || !layers) {
                                    res.send([]);
                                } else {
                                    console.log('4. found the match layers by Geometry! length: ' + layers.length);
                                    res.send(layers);
                                }
                            });
                        }
                    })
                }
            });
        }
    });
});

module.exports = router;
