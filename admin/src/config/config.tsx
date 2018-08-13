console.log("NODE_ENV: " + process.env.NODE_ENV);

let path: string;
let ip: string;
let isRemote: boolean;

if (process.env.NODE_ENV === 'production') {
    path = 'tb-server.webiks.com';
    ip = '34.218.228.21';
    isRemote = true;
} else {
    path = 'localhost:4000';
    ip = '127.0.0.1';
    isRemote = false;
}

console.log('Config Path: ' + path + ', ip: ' + ip);

const config = {
    ip,
    path,
    isRemote,
    baseUrl: `http://${path}`,
    geoBaseUrl: `http://${ip}:${8080}`,
    authorization: 'Basic YWRtaW46Z2Vvc2VydmVy',
    geoserverUserName: 'sdf09rt2s',
    maxFileSize: 50000 * 1024 * 1024
};

export default config;
