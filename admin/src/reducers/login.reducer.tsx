import { ILoginAction, LoginActionTypes } from '../actions/login.actions';

export interface ILoginState {
    isAuthenticated: boolean;
    loaded: boolean;
}

const initialState: ILoginState = {
    isAuthenticated: false,
    loaded: false
};

const reducer = (state: ILoginState = initialState, action: ILoginAction) => {
    switch (action.type) {
        case LoginActionTypes.SET_AUTH:
            return { ...state, isAuthenticated: action.payload, loaded: true  };

        default:
            return state;
    }
};

export default reducer;
