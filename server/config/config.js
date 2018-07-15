const config =
    {
    "serverPort": 4000,
    "geoServerPort": 8080,
    "baseUrlLocal": "http://localhost",
    "baseUrlRemote": "http://tb-server.webiks.com",
    "baseUrlGeoserver":
        {
        "baseUrl": "geoserver",
        "restUrl": "geoserver/rest",
        "restWorkspaces": "geoserver/rest/workspaces",
        "restImports": "geoserver/rest/imports"
        },
    "baseUrlAppGetLayer": "api/layers/layer",
    "wmtsServiceUrl": "gwc/service/wmts?SERVICE=wmts&REQUEST=getcapabilities&VERSION=1%2E0%2E0",
    "baseCurl": "curl -u admin:geoserver",
    "headers":
        {
        "Authorization":"Basic YWRtaW46Z2Vvc2VydmVy",
        "Content-Type":"application/json",
        "Accept":"application/json"
        },
    "maxFileSize" : 50000000000,
    "login":
        {
        "usernameKey": "TB_USERNAME",
        "passwordKey": "TB_PASSWORD"
        }
    };


module.exports = function(){

    this.configBaseUrl = () => {
        // set the urls
        const baseGeoserverUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.baseUrl}`;
        const baseGeoserverRestUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restUrl}`;
        const baseGeoserverWorkspacesUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restWorkspaces}`;
        const baseGeoserverImportsUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restImports}`;

        let baseUrl = '';

        if (process.env.NODE_ENV === "production") {
            baseUrl = config.baseUrlRemote;
        } else {
            baseUrl = config.baseUrlLocal;
        }

        console.log("Config Base URL: " + baseUrl);

        return {
            configUrl: {
                baseUrlGeoserver: `${baseUrl}:${baseGeoserverUrl}`,
                baseRestUrlGeoserver: `${baseUrl}:${baseGeoserverRestUrl}`,
                baseWorkspacesUrlGeoserver: `${baseUrl}:${baseGeoserverWorkspacesUrl}`,
                reqImportCurl: `${baseUrl}:${baseGeoserverImportsUrl}`,
                baseUrlAppGetLayer: `${baseUrl}:${config.serverPort}/${config.baseUrlAppGetLayer}`
            }
        };

    };
};

