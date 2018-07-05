import axios from 'axios';
import config from '../../config/config';

class LoginService {
    static login(username: string, password: string) {
        return   axios.post(`${config.login.baseUrl}/login`, { username, password }, { withCredentials: true });
    }

    static checkAuth() {
        return axios.post(`${config.login.baseUrl}/checkAuth`, {}, { withCredentials: true })
    }

    static logout() {
        return axios.post(`${config.login.baseUrl}/logout`, {}, { withCredentials: true })
    }
}

export default LoginService;