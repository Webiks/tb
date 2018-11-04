import { ITBAction } from '../consts/action-types';
import { IWorld } from './IWorld';

export interface IPropsWorlds {
    worldsList: IWorld[],
    setWorlds: (worlds: IWorld[]) => ITBAction,
    setInitialState: () => void
}