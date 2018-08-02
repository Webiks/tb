import { IWorldLayer } from "./IWorldLayer";

export interface IWorld {
    _id: string,
    name: string,
    desc?: string,
    country?: string,
    directory?: string,
    layers: IWorldLayer[],
    workspaceName: string
}