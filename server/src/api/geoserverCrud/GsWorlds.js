const UploadFilesToGS = require ('./UploadFilesToGS');
const axios  = require ('axios');

require('../../config/serverConfig')();

const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;
const headers = configParams.headers;

class GsWorlds {
    // ==============
    //  POST Request
    // ==============
    // CREATE a new world (workspace) in geoserver by REST api
    static createNewWorldOnGeoserver(name){
        console.log("start createNewWorldOnGeoserver..." + name);
        // 1. create the JSON file with the desire workspace
        const workspaceJSON = JSON.stringify(createWorkspaceObject(name));

        // 2. send a POST request to create the new workspace
        return axios.post(`${configUrl.baseWorkspacesUrlGeoserver}`, workspaceJSON, { headers: headers })
            .then( response => {
                console.log("GsWorlds: create world response: " + response.data);
                return response.data;
            })
            .catch( error => {
                console.error(`gs WORLD: Failed to CREATE ${name} world!: ${error}`);
                return error;
            });
    }

    // =================
    //  DELETE Requests
    // =================
    // delete a world (workspace) from geoserver by REST api
    static deleteWorldFromGeoserver(name) {
        console.log("start deleteWorldFromGeoserver..." + name);
        return axios.delete(`${configUrl.baseWorkspacesUrlGeoserver}/${name}?recurse=true`, { headers: headers })
            .then( response => {
                console.log("GsWorld delete respone: " + response);
                return response.data;
            })
            .catch( error => {
                console.error(`gs WORLD: Failed to DELETE ${name} world!: ${error}`);
                return error;
            });
    }

    // ========================================= private  F U N C T I O N S ============================================
    handleError(error, message){
        console.error('gs WORLD: ' + message);
        return error;
    };
}

module.exports = GsWorlds;