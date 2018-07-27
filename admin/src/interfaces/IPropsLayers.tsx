import { IWorld } from './IWorld';
import { ITBAction } from '../consts/action-types';

export interface IPropsLayers {
    match?: any,
    worldName: string,
    world: IWorld,
    updateWorld:  (worlds: Partial<IWorld>) => ITBAction
}