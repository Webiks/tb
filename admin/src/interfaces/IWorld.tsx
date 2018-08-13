import { IWorldLayer } from "./IWorldLayer";

export interface IWorld {
    _id: string,
    name: string,
    password: string,
    desc?: string,
    country?: string,
    directory?: string,
    layers: IWorldLayer[],
    layersId: string[],
    workspaceName: string
}