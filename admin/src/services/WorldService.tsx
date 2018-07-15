import axios from 'axios';
import config from "../config/config";
import { ILayer } from '../interfaces/ILayer';
import { IWorld } from '../interfaces/IWorld';

export class WorldService {

    static baseUrl: string = `${config.baseUrl.path}/${config.baseUrl.api}/worlds`;

    // ==============
    //  GET Requests
    // ==============
    // get all layers of the world (including the ILayer's fields)
    static getWorlds(): Promise<any> {
        console.warn("start the getWorlds service..." + this.baseUrl);
        return axios
            .get(this.baseUrl)
            .then(res => res.data.workspaces.workspace)
            .then(data => data.map((world: any) => {
                return {
                    name: world.name
                }
            }))
    }

    static getWorld(name: string): Promise<any> {
        console.warn("start the getWorld service..." + `${this.baseUrl}/${name}`);
        return axios
            .get(`${this.baseUrl}/${name}`)
            .then(res => {
                return {
                    name: res.data.workspace.name
                }
            })
            .catch(() => undefined);
    }

    // ====================
    //  CREATE a new World
    // ====================
    // get all layers of the world (including the ILayer's fields)
    static createWorld(name: string): Promise<any> {
        console.log("start the CREATE WORLD service..." + `${this.baseUrl}/${name}`);
        return axios
            .post(`${this.baseUrl}/${name}`)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to create new World: " + name);
                return res;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to create new World: " + error));
    }

    // =======================
    //  UPDATE a World's name
    // =======================
    // get all layers of the world (including the ILayer's fields)
    static updateWorld(name: string, newName: string): Promise<any> {
        console.log("start the UPDATE WORLD service..." + newName);
        const data = { name : newName };
        console.warn("UPDATE WORLD data: " + JSON.stringify(data));
        return axios
            .put(`${this.baseUrl}/${name}`, data)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to update World with the name: " + name);
                return res;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to update the World: " + error));
    }

    // ==============
    // DELETE Request
    // ==============

    // delete world(workspace) from geoserver
    static deleteWorldByName(name: string): Promise<any> {
        console.warn("start the DELETE WORLD service for layer: " + name);
        return axios
            .delete(`${this.baseUrl}/${name}`)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to delete World: " + name);
                return res;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to delete World: " + name + " error: " + error));
    }

}