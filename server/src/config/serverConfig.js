module.exports = function(){

    this.config = () => {
        return {
            configParams: {
                serverPort: 4000,
                mongoPort: 27017,
                geoServerPort: 8080,
                localIP: "://127.0.0.1",
                remoteIP: "://35.162.61.200",
                dbName: 'tb_database',
                mongoBaseUrl: "mongodb://127.0.0.1:27017",
                geoserverBaseUrl: "http://127.0.0.1:8080",
                baseUrlGeoserver:
                    {
                        baseUrl: "geoserver",
                        restUrl: "geoserver/rest",
                        restWorkspaces: "geoserver/rest/workspaces",
                        restImports: "geoserver/rest/imports"
                    },
                wmtsServiceUrl: "gwc/service/wmts?SERVICE=wmts&REQUEST=getcapabilities&VERSION=1%2E0%2E0",
                uploadFilesUrl: "file://D:/Program%20Files%20(x86)/GeoServer%202%2E13%2E0/data_dir",
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
        const geoserverRestUrl = `${this.config().configParams.baseUrlGeoserver.restUrl}`;
        const geoserverWorkspacesUrl = `${this.config().configParams.baseUrlGeoserver.restWorkspaces}`;
        const geoserverImportsUrl = `${this.config().configParams.baseUrlGeoserver.restImports}`;

        let baseUrl = '';

        if (process.env.NODE_ENV === "production") {
            baseUrl = this.config().configParams.remoteIP;
        } else {
            baseUrl = this.config().configParams.localIP;
        }

        const serverBaseUrl = `http${baseUrl}:${this.config().configParams.serverPort}`;
        console.log("Config Base URL: " + baseUrl);

        return {
            configUrl: {
                serverBaseUrl,
                baseRestUrlGeoserver: `${this.config().configParams.geoserverBaseUrl}/${geoserverRestUrl}`,
                baseWorkspacesUrlGeoserver: `${this.config().configParams.geoserverBaseUrl}/${geoserverWorkspacesUrl}`,
                reqImportCurl: `${this.config().configParams.geoserverBaseUrl}/${geoserverImportsUrl}`
            }
        };
    };
};

// domain: "://tb-server.webiks.com"