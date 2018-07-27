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

        // 1. create the JSON file with the desire workspace
        const workspaceJSON = JSON.stringify(createWorkspaceObject(name));

        // 2. send a POST request to create the new workspace
        axios.post(`${configUrl.baseWorkspacesUrlGeoserver}`, workspaceJSON, { headers: headers })
            .then((response) => res.send(response.data))
            .catch((error) => {
                console.error("error!", error.response);
                res.status(500).send(`Failed to create ${name} world! :` + error);
            });
    }

    // ===============
    //   PUT Requests
    // ===============
    // UPDATE the name of a world (workspace) in geoserver by REST api
    static updateWorldNameInGeoserver(oldname, newname, layers){
        // 1. create a new workspace with the new name
        this.createNewWorldOnGeoserver(newname)
            .then ( response => {
                // 2. copy the contents of the old workspace into the new workspace (upload the layers to the new workspace)
                layers.map( layer => UploadFilesToGS.uploadFile(newname, layer.layer.type, layer.layer.fileName, layer.layer.filePath))
            })
            .then ( response => {
                // 3. remove the old workspace
                this.deleteWorld(oldname);
            })
            .then ((response) => res.send(response.data))
            .catch((error) => {
                console.error("error!", error.response);
                res.status(500).send(`Failed to update ${oldname} world! :` + error);
            });
    }

    // =================
    //  DELETE Requests
    // =================
    // delete a world (workspace) from geoserver by REST api
    static deleteWorldFromGeoserver(name) {
        axios.delete(`${configUrl.baseWorkspacesUrlGeoserver}/${name}?recurse=true`, { headers: headers })
            .then((response) => res.send(response.data))
            .catch((error) => {
                console.error("error!", error.response);
                res.status(500).send(`Failed to delete ${name} world! :` + error);
            });
    }
}

module.exports = GsWorlds;