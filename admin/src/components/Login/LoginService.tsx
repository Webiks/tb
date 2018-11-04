import axios from 'axios';
import config from '../../config/config';

class LoginService {
    static loginUrl = `${config.baseUrl}/login`;

    static login(username: string, password: string) {
        return axios.post(`${this.loginUrl}/login`, { username, password }, { withCredentials: true });
    }

    static checkAuth() {
        return axios.post(`${this.loginUrl}/checkAuth`, {}, { withCredentials: true });
    }

    static logout() {
        return axios.post(`${this.loginUrl}/logout`, {}, { withCredentials: true });
    }
}

export default LoginService;