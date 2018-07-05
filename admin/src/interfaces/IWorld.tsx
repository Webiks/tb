import { IWorldLayer } from "./IWorldLayer";

export interface IWorld {
    name: string;
    desc?: string;
    country?: string;
    directory?: string;
    layers: IWorldLayer[];
}