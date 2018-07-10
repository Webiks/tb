
let path: string = '';

if (process.env.NODE_ENV === 'production') {
    path = 'http://tb-server.webiks.com';
} else {
    path = 'http://localhost:4000';
}

const config = {
    baseUrl: {
       path,
       api: 'api',
       login: 'login'
    },
    authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
    geoserverUserName: 'sdf09rt2s',
    maxFileSize: 20000 * 1024 * 1024
};

export default config;
