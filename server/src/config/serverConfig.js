module.exports = function(){

    this.config = () => {
        return {
            configParams: {
                serverPort: 4000,
                mongoPort: 27017,
                geoServerPort: 8080,
                localIP: "://127.0.0.1",
                remoteIP: "://34.218.228.21",
                domain: "://tb-server.webiks.com",
                dbName: 'tb_database',
                mongoBaseUrl: "mongodb://127.0.0.1:27017",
                // geoserverBaseUrl: "http://127.0.0.1:8080",
                baseUrlGeoserver:
                    {
                        baseUrl: "geoserver",
                        restUrl: "geoserver/rest",
                        restWorkspaces: "geoserver/rest/workspaces",
                        restImports: "geoserver/rest/imports"
                    },
                baseUrlAppGetLayer: "api/gsLayers/layer",
                wmtsServiceUrl: "gwc/service/wmts?SERVICE=wmts&REQUEST=getcapabilities&VERSION=1%2E0%2E0",
                uploadFilesUrl: "file:///D:/GeoServer/data_dir",
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
        const geoserverUrl = `${this.config().configParams.baseUrlGeoserver.baseUrl}`;
        const geoserverRestUrl = `${this.config().configParams.baseUrlGeoserver.restUrl}`;
        const geoserverWorkspacesUrl = `${this.config().configParams.baseUrlGeoserver.restWorkspaces}`;
        const geoserverImportsUrl = `${this.config().configParams.baseUrlGeoserver.restImports}`;

        let baseUrl = '';
        let serverBaseUrl = '';

        if (process.env.NODE_ENV === "production") {
            baseUrl = this.config().configParams.remoteIP;
            // serverBaseUrl = `http${baseUrl}`;
        } else {
            baseUrl = this.config().configParams.localIP;
            // serverBaseUrl = `http${baseUrl}:${this.config().configParams.serverPort}`
        }

        // const mongoBaseUrl = `mongodb${baseUrl}:${this.config().configParams.mongoPort}`;
        serverBaseUrl = `http${baseUrl}:${this.config().configParams.serverPort}`;
        const geoserverBaseUrl = `http${baseUrl}:${this.config().configParams.geoServerPort}`;

        console.log("Config Base URL: " + baseUrl);

        return {
            configUrl: {
                // mongoBaseUrl,
                serverBaseUrl,
                baseUrlGeoserver: `${geoserverBaseUrl}/${geoserverUrl}`,
                baseRestUrlGeoserver: `${geoserverBaseUrl}/${geoserverRestUrl}`,
                baseWorkspacesUrlGeoserver: `${geoserverBaseUrl}/${geoserverWorkspacesUrl}`,
                reqImportCurl: `${geoserverBaseUrl}/${geoserverImportsUrl}`,
                baseUrlAppGetLayer: `${serverBaseUrl}/${this.config().configParams.baseUrlAppGetLayer}`
            }
        };
    };
};

