import axios from 'axios';
import config from "../config/config";

export class UploadFileService {

    static baseUrl: string = `${config.baseUrl}/v1/api/upload/`;

    // ==============
    //  UPLOAD files
    // ==============
    // get all layers of the world (including the ILayer's fields)
    static upload(worldName: string, files: File[]): Promise<any> {
        console.log("start the upload file service...");
        return axios
            .post(`${this.baseUrl}/${worldName}`, files)
            .then(res => console.log("the upload succeed!"))
            .catch(error => console.log(error));
    }
}