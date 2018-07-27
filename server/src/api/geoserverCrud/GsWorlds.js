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
                console.error(`GsWorlds: Failed to create ${name} world! :` + error);
                return error;
            });
    }

    // ===============
    //   PUT Requests
    // ===============
    // UPDATE the name of a world (workspace) in geoserver by REST api
    static updateWorldNameInGeoserver(oldname, newname, layers){
        console.log("start update world name in Geoserver...");
        console.log("old name: " + oldname + ", new name: " + newname);
        // 1. create a new workspace with the new name
        return GsWorlds.createNewWorldOnGeoserver(newname)
            .then ( response => {
                console.log("finished to create a new workspace in Geoserver..." + response);
                // 2. copy the contents of the old workspace into the new workspace (upload the layers to the new workspace)
                if(layers.length !== 0){
                    layers.map( layer => UploadFilesToGS.uploadFile(newname, layer.layer.type, layer.layer.fileName, layer.layer.filePath))
                }
                // 3. remove the old workspace
                GsWorlds.deleteWorldFromGeoserver(oldname)
                    .then ( response => res.send(response.data))
                    .catch( error => {
                        console.error(`GsWorlds: Failed to delete ${oldname} world! :` + error);
                        return error;
                    });
            })
            .catch( error => {
                console.error(`GsWorlds: Failed to update ${oldname} world! :` + error);
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
                console.error(`GsWorlds: Failed to delete ${name} world! :` + error);
                return error;
            });
    }
}

module.exports = GsWorlds;