const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/configJson');
const { execSync } = require('child_process');          // for using the cURL command line
require('./curlMethods')();

const urlGetWorkspaces = `${config.baseUrlGeoserver.restUrl}/workspaces`;
const authorization = config.headers.Authorization;

// ==============
//  GET Requests
// ==============

// get all the worlds from geoserver
router.get('/', (req, res) => {
    console.log("TB SERVER: start getWorlds url = " + urlGetWorkspaces);
    axios.get(`${urlGetWorkspaces}.json`, { headers: {authorization} })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`there are no worlds!`);
        });
});

// get world from geoserver
router.get('/:worldName', (req, res) => {
    axios.get(`${urlGetWorkspaces}/${req.params.worldName}.json`, { headers: {authorization} })
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
    axios.post(`${urlGetWorkspaces}`, workspaceJSON, { headers: config.headers })
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
    axios.put(`${urlGetWorkspaces}/${req.params.worldName}`, req.body, { headers: config.headers })
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
    axios.delete(`${urlGetWorkspaces}/${req.params.worldName}?recurse=true`, { headers: config.headers })
        .then((response) => res.send(response.data))
        .catch((error) => {
            console.error("error!", error.response);
            res.status(404).send(`Failed to delete ${req.params.worldName} world! :` + error);
        });
});

module.exports = router;