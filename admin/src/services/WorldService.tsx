import axios from 'axios';
import config from "../config/config";
import { IWorld } from '../interfaces/IWorld';

export class WorldService {

    static baseUrl: string = `${config.baseUrl}/api/dbWorlds`;

    // Handle ERRORS
    static handleError = (error, message) => {
        console.error(message);
        throw new Error(error);
    };

    // ==============
    //  GET Requests
    // ==============
    // get all worlds from the Database
    static getWorlds(): Promise<any> {
        console.warn("start the getWorlds service..." + this.baseUrl);
        return axios
            .get(this.baseUrl)
            .then(res => res.data)
            .then(data => data.map((world: any) => world))
            .catch(error => this.handleError(error, "WORLD SERVICE: There are NO Worlds!!!: " + error));
            // .catch(() => undefined);
    }

    static getWorld(name: string): Promise<any> {
        console.warn("start the getWorld service..." + `${this.baseUrl}/${name}`);
        return axios
            .get(`${this.baseUrl}/${name}`)
            .then(res => res.data)
            .catch(error => this.handleError(error, "WORLD SERVICE: There is NO such World!!!: " + error));
    }

    // ====================
    //  CREATE a new World
    // ====================
    static createWorld(newWorld: IWorld): Promise<any> {
        console.log("start the CREATE WORLD service..." + `${this.baseUrl}/${name}`);
        newWorld.workspaceName = newWorld.name;
        return axios
            .post(`${this.baseUrl}/${newWorld.name}`, newWorld)
            .then(res => res.data)
            .catch(error => this.handleError(error, "WORLD SERVICE: FAILED to create a new World: " + error));
    }

    // =================
    //  UPDATE Requests
    // =================
    //  UPDATE an existing world with a new world
    static updateWorld(oldWorld: IWorld, newWorld: IWorld): Promise<any> {
        newWorld._id = oldWorld._id;
        console.log("start the UPDATE WORLD service..." + oldWorld.name);
        return axios
            .put(`${this.baseUrl}/${oldWorld.name}`, newWorld)
            .then(res => res.data)
            .catch(error => this.handleError(error, "WORLD SERVICE: FAILED to update the World: " + error));
    }

    //  UPDATE a single Field in an existing world
    static updateWorldField(world: IWorld, fieldName: string, fieldValue : any): Promise<any> {
        const id = world._id;
        const layersId = world.layersId;
        const data = {
            _id: id,
            layersId,
            newValue: fieldValue
        };
        console.log("start the UPDATE WORLD's FIELD service..." + world.name + ', ' + fieldName);
        return axios
            .put(`${this.baseUrl}/${world.name}/${fieldName}`, data)
            .then(res => res.data)
            .catch(error => this.handleError(error,"WORLD SERVICE: FAILED to update the World: " + error));
    }

    // ==============
    // DELETE Request
    // ==============
    static deleteWorld(world: IWorld): Promise<any> {
        console.log("start the DELETE WORLD service for world: " + world.name + ', ' + world._id);
        return axios
            .delete(`${this.baseUrl}/delete/${world.workspaceName}/${world._id}`)
            .then(res => {
                console.log("WORLD SERVICE: SUCCEED to delete World: " + world.name);
                return res.data;
            })
            .catch(error => this.handleError(error,"WORLD SERVICE: FAILED to delete World: " + world.name + " error: " + error));
    }
}