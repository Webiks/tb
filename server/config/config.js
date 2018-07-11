const config = require('./configJson');

module.exports = function(){

    this.configBaseUrl = () => {
        // set the urls
        const baseGeoserverUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.baseUrl}`;
        const baseGeoserverRestUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restUrl}`;
        const baseGeoserverWorkspacesUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restWorkspaces}`;
        const baseGeoserverImportsUrl = `${config.geoServerPort}/${config.baseUrlGeoserver.restImports}`;

        let baseUrl = '';
        const prod = (process.env.NODE_ENV).trim();

        if (prod === "production") {
            baseUrl = config.baseUrlRemote;
            console.log("inside prod: " + baseUrl);
        } else {
            baseUrl = config.baseUrlLocal;
            console.log("inside else: " + baseUrl);
        }

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

