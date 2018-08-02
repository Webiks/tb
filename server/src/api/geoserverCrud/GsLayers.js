const UploadFilesToGS = require ('./UploadFilesToGS');
const axios  = require ('axios');

require('../../config/serverConfig')();

const configParams = config().configParams;
const configUrl = configBaseUrl().configUrl;
const headers = configParams.headers;
const authorization = headers.authorization;

class GsLayers {
    // ==============
    //  GET Requests
    // ==============
    // get a list of all the layers of the world from geoserver by REST api
    static getWorldLayerListFromGeoserver(worldName) {
        const urlGetLayers = `${configUrl.baseWorkspacesUrlGeoserver}/${worldName}/layers.json`;
        console.log("GsLayers: start GET-ALL world's layers from Geoserver..." + urlGetLayers);
        return axios.get(urlGetLayers, { headers: { authorization } })
            .then( response => response.data)
            .catch( error => error );
    }

    // get the layer type & resource info ("layer" field - type ILayerDetails) from geoserver by REST api
    static getLayerInfoFromGeoserver(worldName, layerName) {
        const urlGetLayer = `${configUrl.baseWorkspacesUrlGeoserver}/${worldName}/layers/${layerName}.json`;
        console.log("GsLayers: start GET LAYER INFO url = " + urlGetLayer);
        return axios.get(urlGetLayer, { headers: { authorization } })
            .then( response => response.data)
            .catch( error => {
                console.error(`GsLayers: getLayerInfoFromGeoserver ERROR: layer ${layerName} can't be found!: 
                ${error}`);
                return error;
            });
    }

    // get layer's details ("data" field - type ILayerDetails) from geoserver by REST api
    // using the resource href that we got from the "layer's info" request
    static getLayerDetailsFromGeoserver(resourceUrl) {
        console.log("GsLayers: GET LAYER DETAILS url: " + resourceUrl);
        return axios.get(resourceUrl, { headers: { authorization } })
            .then( response => response.data)
            .catch( error => {
                console.error(`GsLayers: getLayerDetailsFromGeoserver ERROR: ${error}`);
                return error;
            });
    }

    // get the layer's store data ("store" field - type ILayerDetails) from geoserver by REST api
    // using the store href that we got from the "layer's details" request
    static getStoreDataFromGeoserver(storeUrl) {
        console.log("GsLayers: start GET STORE DATA url = " + storeUrl);
        return axios.get(storeUrl, { headers: { authorization } })
            .then( response => response.data )
            .catch( error => {
                console.error(`GsLayers: getStoreDataFromGeoserver ERROR! ${error}`);
                return error;
            });
    }

    // get Capabilities XML file - WMTS Request for display the selected layer
    static getCapabilitiesFromGeoserver(capabilitiesUrl) {
        console.log("GsLayers: start GET CAPABILITIES url = " + capabilitiesUrl);
        return axios.get(capabilitiesUrl, { headers: { authorization } })
            .then( response => response.data)
            .catch( error => error );
    }

    // ===============
    //   PUT Requests - W O R L D S
    // ===============
    // UPDATE the name of a world (workspace) in geoserver by REST api
    // static updateWorldNameInGeoserver(oldname, newname, layers){
    //     console.log("start update world name in Geoserver...");
    //     console.log("old name: " + oldname + ", new name: " + newname);
    //     // 1. create a new workspace with the new name
    //     return GsLayers.createNewWorldOnGeoserver(newname)
    //         .then ( response => {
    //             console.log("finished to create a new workspace in Geoserver..." + response);
    //             // 2. copy the contents of the old workspace into the new workspace (upload the layers to the new workspace)
    //             if(layers.length !== 0){
    //                 layers.map( layer => UploadFilesToGS.uploadFile(newname, layer.layer.type, layer.layer.fileName, layer.layer.filePath))
    //             }
    //             // 3. remove the old workspace
    //             GsLayers.deleteWorldFromGeoserver(oldname)
    //                 .then ( response => res.send(response.data))
    //                 .catch( error => {
    //                     console.error(`GsWorlds: Failed to delete ${oldname} world! :` + error);
    //                     return error;
    //                 });
    //         })
    //         .catch( error => {
    //             console.error(`GsWorlds: Failed to update ${oldname} world! :` + error);
    //             return error;
    //         });
    // }

    // =================
    //  DELETE Requests
    // =================
    // delete a layer from geoserver by REST api
    static deleteLayerFromGeoserver(url){
        console.log("GsWorlds: start DELETE LAYER from GEOSERVER = " + url);
        return axios.delete(`${url}?recurse=true`, { headers: { authorization } })
            .then( response => {
                console.log(`success to delete the layer! ${url}`);
                return response.data;
            })
            .catch( error => {
                console.error(`GsLayers: getStoreDataFromGeoserver ERROR! ${error}`);
                return error;
            });
    }

    // ========================================= private  F U N C T I O N S ============================================
    getTypeData(fileType){
        const typeData = {};
        switch (fileType) {
            case ('RASTER'):
                typeData.storeType = 'coveragestores';
                typeData.layerDetailsType = 'coverages';
                break;
            case ('VECTOR'):
                typeData.storeType = 'datastores';
                typeData.layerDetailsType = 'featuretypes';
                break;
        }
        return typeData;
    }
}



module.exports = GsLayers;