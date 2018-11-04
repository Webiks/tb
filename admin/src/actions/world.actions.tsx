import { ActionTypes, ITBAction } from '../consts/action-types';
import { IWorld } from '../interfaces/IWorld';

export class WorldsActions {
    static setWorldsAction = (worlds: IWorld[]): ITBAction => ({
        type: ActionTypes.SET_WORLDS,
        payload: worlds
    });

    static updateWorldAction = (world: Partial<IWorld>): ITBAction => ({
        type: ActionTypes.UPDATE_WORLD,
        payload: world
    });
}





