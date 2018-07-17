import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IState } from '../../store';
import { ITBAction } from '../../consts/action-types';
import { IWorld } from '../../interfaces/IWorld';
import { WorldsActions } from '../../actions/world.actions';
import WorldsDataTable from './WorldsDataTable';
import { WorldService } from '../../services/WorldService';
import { Route, withRouter } from 'react-router';
import World from '../World/World';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { ProgressSpinner } from 'primereact/components/progressspinner/ProgressSpinner';

export interface IPropsWorlds {
    match: any,
    worldsList: IWorld[],
    setWorlds: (worlds: IWorld[]) => ITBAction
}

export interface IStateWorld {
    hideSpinner: boolean
}

class Worlds extends React.Component {
    props: IPropsWorlds;
    state: IStateWorld = { hideSpinner: true };

    // GET: get all worlds on startUp
    componentDidMount() {
        this.setState({ hideSpinner: false } );
        WorldService.getWorlds()
            .then((worlds: IWorld[]) => {
                // get the input Data of all the worlds (from the App store)
                const worldsInput = worlds.map((world: IWorld) => this.getInputData(worlds, world));
                this.props.setWorlds([...worldsInput]);
                this.setState({ hideSpinner: true } );
            })
            .catch(error => this.props.setWorlds([]));
    };

    // get the input Data of the world from the App store
    getInputData = (worlds: IWorld[], world: IWorld): IWorld => {
        // find the world in the App store if exist
        const worldsList = this.props.worldsList.length === 0 ? worlds : this.props.worldsList;
        const appWorld = worldsList.find(({ name, layers }: IWorld) => world.name === name);
        return {
            name: world.name,
            desc: appWorld.desc ? appWorld.desc : '',
            country: appWorld.country ? appWorld.country : '',
            directory: appWorld.directory ? appWorld.directory : '',
            layers: appWorld.layers ? appWorld.layers : []
        };
    };

    render() {
        return (
            <div>
                <Route path="/world/:worldName" component={World}/>
                {
                    this.props.match.isExact
                        ? this.props.worldsList &&
                            <div>
                                <div>
                                    <div style={{ width: '70%', margin: 'auto' }}>
                                        <WorldsDataTable/>
                                    </div>
                                </div>
                                <div hidden={this.state.hideSpinner}>
                                    <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="#EEEEEE" animationDuration=".5s"/>
                                </div>
                            </div>
                        : null
                }
            </div>
        );
    };
}

const mapStateToProps = (state: IState, { match }: any) => ({
    match,
    worldsList: state.worlds.list
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ setWorlds: WorldsActions.setWorldsAction }, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Worlds) as any);

