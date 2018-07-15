const express = require('express');
const router = express.Router();
const axios = require('axios');

require('../config/serverConfig')();
require('./curlMethods')();

const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;
const headers = configParams.headers;
console.log("headers: " + JSON.stringify(headers));
const authorization = headers.authorization;

// ==============
//  GET Requests
// ==============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    console.log("TB SERVER: start getWorlds url = " + configUrl.baseWorkspacesUrlGeoserver);
    axios.get(`${configUrl.baseWorkspacesUrlGeoserver}.json`, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`there are no worlds!`);
        });
});

// get world from geoserver
router.get('/:worldName', (req, res) => {
    axios.get(`${configUrl.baseWorkspacesUrlGeoserver}/${req.params.worldName}.json`, { headers: { authorization } })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`world ${req.params.worldName} can't be found!`);
        });
});

// ==============
//  POST Request
// ==============

// create a new world (workspace) in geoserver by REST api
router.post('/:worldName', (req, res) => {

    // 1. create the JSON file with the desire workspace
    const workspaceJSON = JSON.stringify(createWorkspaceObject(req.params.worldName));

    // 2. send a POST request to create the new workspace
    axios.post(`${configUrl.baseWorkspacesUrlGeoserver}`, workspaceJSON, { headers: headers })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`Failed to create ${req.params.worldName} world! :` + error);
        });
});

// ===============
//   PUT Requests
// ===============
// update the name of a world (workspace) in geoserver by REST api
router.put('/:worldName', (req, res) => {
    console.log("PUT data:" + JSON.stringify(req.body));
    axios.put(`${configUrl.baseWorkspacesUrlGeoserver}/${req.params.worldName}`, req.body, { headers: headers })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`Failed to update ${req.params.worldName} world! :` + error);
        });

    // updateWorkspaceInGeoserver(req.params.worldName, req.params.newName)
});

// =================
//  DELETE Requests
// =================
// delete a world (workspace) from geoserver by REST api
router.delete('/:worldName', (req, res) => {
    axios.delete(`${configUrl.baseWorkspacesUrlGeoserver}/${req.params.worldName}?recurse=true`, { headers: headers })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
        });
});

module.exports = router;