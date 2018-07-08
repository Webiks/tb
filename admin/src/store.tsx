import { routerMiddleware, routerReducer as router, RouterState } from 'react-router-redux';
import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import createHistory from 'history/createHashHistory';
import worlds, { IWorldsState } from './reducers/worlds.reducer';
import login, { ILoginState } from './reducers/login.reducer';

export const history = createHistory();
const middleware = routerMiddleware(history);

export interface IState {
    router: RouterState;
    worlds: IWorldsState;
    login: ILoginState
}

const reducers: Reducer<IState> = combineReducers<IState>({ router, worlds, login });

const store = createStore(
    reducers,
    applyMiddleware(middleware)
);

export default store;
