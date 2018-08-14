console.log("NODE_ENV: " + process.env.NODE_ENV);

let ip: string;
let isRemote: boolean;
const serverPort: number = 4000;
const geoserverPort: number = 8080;

if (process.env.NODE_ENV === 'production') {
    // path = 'tb-server.webiks.com';
    ip = '34.218.228.21';
    isRemote = true;
} else {
    // path = 'localhost:4000';
    ip = '127.0.0.1';
    isRemote = false;
}

const config = {
    ip,
    isRemote,
    path: `${ip}:${serverPort}`,
    baseUrl: `http://${ip}:${serverPort}`,
    geoBaseUrl: `http://${ip}:${geoserverPort}`,
    authorization: 'Basic YWRtaW46Z2Vvc2VydmVy',
    geoserverUserName: 'sdf09rt2s',
    maxFileSize: 50000 * 1024 * 1024
};

console.log('Config Path: ' + config.path );

export default config;
