export enum ActionTypes {
    SET_WORLDS = 'SET_WORLDS',
    UPDATE_WORLD = 'UPDATE_WORLD',
}

export interface ITBAction {
    type: ActionTypes;
    payload: any;
}
