module.exports = function(){

    this.config = () => {
        return {
            configParams: {
                serverPort: 4000,
                geoServerPort: 8080,
                baseUrlLocal: "http://localhost",
                baseUrlRemote: "http://tb-server.webiks.com",
                baseUrlGeoserver:
                    {
                        baseUrl: "geoserver",
                        restUrl: "geoserver/rest",
                        restWorkspaces: "geoserver/rest/workspaces",
                        restImports: "geoserver/rest/imports"
                    },
                baseUrlAppGetLayer: "api/layers/layer",
                wmtsServiceUrl: "gwc/service/wmts?SERVICE=wmts&REQUEST=getcapabilities&VERSION=1%2E0%2E0",
                baseCurl: "curl -u admin:geoserver",
                headers:
                    {
                        authorization:"Basic YWRtaW46Z2Vvc2VydmVy",
                        "Content-Type":"application/json",
                        accept:"application/json"
                    },
                maxFileSize : 50000000000,
                login:
                    {
                        usernameKey: "TB_USERNAME",
                        passwordKey: "TB_PASSWORD"
                    }
            }
        };
    };

    this.configBaseUrl = () => {
        // set the urls
        const baseGeoserverUrl = `${this.config().configParams.geoServerPort}/${this.config().configParams.baseUrlGeoserver.baseUrl}`;
        const baseGeoserverRestUrl = `${this.config().configParams.geoServerPort}/${this.config().configParams.baseUrlGeoserver.restUrl}`;
        const baseGeoserverWorkspacesUrl = `${this.config().configParams.geoServerPort}/${this.config().configParams.baseUrlGeoserver.restWorkspaces}`;
        const baseGeoserverImportsUrl = `${this.config().configParams.geoServerPort}/${this.config().configParams.baseUrlGeoserver.restImports}`;

        let baseUrl = '';

        if (process.env.NODE_ENV === "production") {
            baseUrl = this.config().configParams.baseUrlRemote;
        } else {
            baseUrl = this.config().configParams.baseUrlLocal;
        }

        console.log("Config Base URL: " + baseUrl);

        return {
            configUrl: {
                baseUrlGeoserver: `${baseUrl}:${baseGeoserverUrl}`,
                baseRestUrlGeoserver: `${baseUrl}:${baseGeoserverRestUrl}`,
                baseWorkspacesUrlGeoserver: `${baseUrl}:${baseGeoserverWorkspacesUrl}`,
                reqImportCurl: `${baseUrl}:${baseGeoserverImportsUrl}`,
                baseUrlAppGetLayer: `${baseUrl}:${this.config().configParams.serverPort}/${this.config().configParams.baseUrlAppGetLayer}`
            }
        };

    };
};



// this.config =
//     {
//         "serverPort": 4000,
//         "geoServerPort": 8080,
//         "baseUrlLocal": "http://localhost",
//         "baseUrlRemote": "http://tb-server.webiks.com",
//         "baseUrlGeoserver":
//             {
//                 "baseUrl": "geoserver",
//                 "restUrl": "geoserver/rest",
//                 "restWorkspaces": "geoserver/rest/workspaces",
//                 "restImports": "geoserver/rest/imports"
//             },
//         "baseUrlAppGetLayer": "api/layers/layer",
//         "wmtsServiceUrl": "gwc/service/wmts?SERVICE=wmts&REQUEST=getcapabilities&VERSION=1%2E0%2E0",
//         "baseCurl": "curl -u admin:geoserver",
//         "headers":
//             {
//                 "authorization":"Basic YWRtaW46Z2Vvc2VydmVy",
//                 "contentType":"application/json",
//                 "accept":"application/json"
//             },
//         "maxFileSize" : 50000000000,
//         "login":
//             {
//                 "usernameKey": "TB_USERNAME",
//                 "passwordKey": "TB_PASSWORD"
//             }
//     };