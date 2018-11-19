import axios from 'axios';
import config from "../config/config";

export class FileService {

    static baseUrl: string = `${config.baseUrl}/v1/api/fs`;

    // ==============
    //  REMOVE files
    // ==============
    // get all layers of the world (including the ILayer's fields)
    static removeFile(filePath: string): Promise<any> {
        console.log(`start the remove file service...${this.baseUrl}/${filePath}`);
        const body = { filePath };
        return axios
            .post(`${this.baseUrl}/`, body)
            .then(res => console.log(res))
            .catch(error => console.log(error));
    }
}