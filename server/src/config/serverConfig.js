module.exports = function(){

    this.config = () => {
        return {
            configParams: {
                serverPort: 4000,
                mongoPort: 27017,
                geoServerPort: 8080,
                baseUrlLocal: "://127.0.0.1",
                baseUrlRemote: "://tb-server.webiks.com",
                dbName: 'tb_database',
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
        const geoserverUrl = `${this.config().configParams.baseUrlGeoserver.baseUrl}`;
        const geoserverRestUrl = `${this.config().configParams.baseUrlGeoserver.restUrl}`;
        const geoserverWorkspacesUrl = `${this.config().configParams.baseUrlGeoserver.restWorkspaces}`;
        const geoserverImportsUrl = `${this.config().configParams.baseUrlGeoserver.restImports}`;

        let baseUrl = '';
        let serverBaseUrl = '';

        if (process.env.NODE_ENV === "production") {
            baseUrl = this.config().configParams.baseUrlRemote;
            serverBaseUrl = `http${baseUrl}`;
        } else {
            baseUrl = this.config().configParams.baseUrlLocal;
            serverBaseUrl = `http${baseUrl}:${this.config().configParams.serverPort}`
        }

        // mongodb://localhost:27017
        const mongoBaseUrl = `mongodb${baseUrl}:${this.config().configParams.mongoPort}`;
        const geoserverBaseUrl = `http${baseUrl}:${this.config().configParams.geoServerPort}`;

        console.log("Config Base URL: " + baseUrl);

        return {
            configUrl: {
                mongoBaseUrl,
                serverBaseUrl,
                baseUrlGeoserver: `${geoserverBaseUrl}/${geoserverUrl}`,
                baseRestUrlGeoserver: `${geoserverBaseUrl}/${geoserverRestUrl}`,
                baseWorkspacesUrlGeoserver: `${geoserverBaseUrl}/${geoserverWorkspacesUrl}`,
                reqImportCurl: `${geoserverBaseUrl}/${geoserverImportsUrl}`,
                baseUrlAppGetLayer: `${geoserverBaseUrl}/${this.config().configParams.baseUrlAppGetLayer}`
            }
        };

    };
};

// baseUrlLocal: "://localhost",
