console.log("NODE_ENV: " + process.env.NODE_ENV);

let isRemote: boolean;
let domain: string;
const serverPort: number = 10010;
const geoserverPort: number = 8080;

const localDomain: string = 'http://127.0.0.1';
const remoteDomain: string = 'http://tb-admin.webiks.com';
const serverDomain: string = 'http://tb-server.webiks.com';

if (process.env.NODE_ENV === 'production') {
    domain = remoteDomain;
    isRemote = true;
} else {
    domain = localDomain;
    isRemote = false;
}

const config = {
    isRemote,
    domain,
    baseUrl: `${domain}:${serverPort}`,
    geoBaseUrl: `${domain}:${geoserverPort}`,
    authorization: 'Basic YWRtaW46Z2Vvc2VydmVy',
    geoserverUserName: 'sdf09rt2s',
    maxFileSize: 100000 * 1024 * 1024
};

console.log('Config Domain: ' + config.domain );

export default config;
