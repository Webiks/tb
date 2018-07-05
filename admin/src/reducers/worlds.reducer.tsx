import { IWorld } from '../interfaces/IWorld';
import { ActionTypes, ITBAction } from '../consts/action-types';

export interface IWorldsState {
    list: IWorld[];
}

const initialState: IWorldsState = {
    list: []
};

const reducer = (state: IWorldsState = initialState, action: ITBAction) => {
    switch (action.type) {
        case ActionTypes.SET_WORLDS: {
            const list = action.payload;
            return { ...state, list };
        }

        case ActionTypes.UPDATE_WORLD: {
            const list = state.list.map((world) => {
                if (world.name === action.payload.name) {
                    return { ...world, ...action.payload }
                }
                return world;
            });
            return { ...state, list };
        }

        default:
            return state;
    }
};

export default reducer;
