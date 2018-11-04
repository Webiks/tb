export enum LoginActionTypes {
    SET_AUTH = 'SET_AUTH'
}

export interface ILoginAction {
    type: LoginActionTypes;
    payload: any;
}

export function SetAuth(payload: boolean): ILoginAction {
    return {
        type: LoginActionTypes.SET_AUTH,
        payload
    };
}
