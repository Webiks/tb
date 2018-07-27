import axios from 'axios';
import config from "../config/config";
import { IWorld } from '../interfaces/IWorld';

export class WorldService {

    // static baseUrl: string = `${config.baseUrl.path}/${config.baseUrl.api}/worlds`;
    static baseUrl: string = `${config.baseUrl.path}/${config.baseUrl.api}/dbWorlds`;

    // ==============
    //  GET Requests
    // ==============
    // get all layers of the world (including the ILayer's fields)
    static getWorlds(): Promise<any> {
        console.warn("start the getWorlds service..." + this.baseUrl);
        return axios
            .get(this.baseUrl)
            .then(res => {
                console.log("WorldService: get all worlds response: " + JSON.stringify(res.data));
                return res.data;
            })
            .then(data => data.map((world: any) => world));
    }

    static getWorld(name: string): Promise<any> {
        console.warn("start the getWorld service..." + `${this.baseUrl}/${name}`);
        return axios
            .get(`${this.baseUrl}/${name}`)
            .then(res => res.data)
            .catch(() => undefined);
    }

    // ====================
    //  CREATE a new World
    // ====================
    static createWorld(newWorld: IWorld): Promise<any> {
        console.log("start the CREATE WORLD service..." + `${this.baseUrl}/${name}`);
        return axios
            .post(`${this.baseUrl}/${newWorld.name}`, newWorld)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to create new World: " + newWorld.name);
                return res.data;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to create new World: " + error));
    }

    // =================
    //  UPDATE Requests
    // =================
    //  UPDATE an existing world with a new world
    static updateWorld(oldWorld: IWorld, newWorld: IWorld): Promise<any> {
        newWorld._id = oldWorld._id;
        console.log("start the UPDATE WORLD service..." + oldWorld.name);
        console.warn("UPDATE WORLD data to be: " + JSON.stringify(newWorld));
        return axios
            .put(`${this.baseUrl}/${oldWorld.name}`, newWorld)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to update World with the name: " + newWorld);
                return res.data;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to update the World: " + error));
    }

    //  UPDATE a single Field in an existing world
    static updateWorldField(world: IWorld, fieldName: string, fieldValue : any): Promise<any> {
        const id = world._id;
        const layers = world.layers;
        const data = {
            _id: id,
            layers,
            value: fieldValue
        };

        console.log("start the UPDATE WORLD's FIELD service..." + world.name + ', ' + fieldName);
        console.warn("UPDATE WORLD data to be: " + JSON.stringify(data));
        return axios
            .put(`${this.baseUrl}/${world.name}/${fieldName}`, data)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to update World's field : " + fieldName + ' to value: ' + fieldValue);
                return res.data;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to update the World: " + error));
    }

    // ==============
    // DELETE Request
    // ==============
    static deleteWorld(world: IWorld): Promise<any> {
        console.warn("start the DELETE WORLD service for layer: " + world.name + ', ' + world._id);
        return axios
            .delete(`${this.baseUrl}/${world.name}/${world._id}`)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to delete World: " + world.name);
                return res.data;
            })
            .catch(error => console.error("WORLD SERVICE: FAILED to delete World: " + world.name + " error: " + error));
    }

}