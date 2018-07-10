import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route } from 'react-router';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { LayerService } from '../../services/LayerService';
import { WorldsActions } from '../../actions/world.actions';
import Layer from '../Layer/Layer';
import LayersDataTable from './LayersDataTable';
import { AFFILIATION_TYPES } from '../../consts/layer-types';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { ITBAction } from '../../consts/action-types';
import { ProgressSpinner } from 'primereact/components/progressspinner/ProgressSpinner';

export interface IPropsLayers {
    world: IWorld,
    updateWorld: (worlds: IWorld) => ITBAction
}

export interface IStateWorld {
    layers: IWorldLayer[]
}

class WorldLayers extends React.Component {
    props: IPropsLayers | any;

    // GET: get the world's layers on startUp
    componentWillMount() {
       this.getAllLayersData();
    };

    getAllLayersData = () => {
        if (!this.props.world.layers.length)  {
            console.log("getAllLayersData...");
            LayerService.getAllLayersData(this.props.world.name)
                .then(layers => {
                    console.log("getAllLayersData getInputData...");
                    // get the input Data for all the world's layers (from the App store)
                    const layersInput = layers.map((layer: IWorldLayer) => {
                        return this.getInputData(layer);
                    });
                    console.log("getAllLayersData refreshing...");
                    this.refresh([...layersInput]);               // update the App store
                })
                .catch(error => this.refresh([]));
        }
    };

    // get the input Data of the layer from the App store
    getInputData = (layer: IWorldLayer): IWorldLayer => {
        console.log("getInputData...");
        return {
            ...layer,
            inputData: layer.inputData || {
                affiliation: AFFILIATION_TYPES.AFFILIATION_UNKNOWN,
                GSD: 0,
                sensor: {
                    maker: '',
                    name: '',
                    bands: []
                },
                flightAltitude: 0,
                cloudCoveragePercentage: 0,
                zoom: 14
            }
        };
    };

    // update the App store and refresh the page
    refresh = (layers: IWorldLayer[]) => {
        console.log('World Home Page: REFRESH...');
        const name = this.props.world.name;
        this.props.updateWorld({ name, layers });
    };

    render() {
        const { world, match } = this.props;
        return (
            match.isExact ?
                <div>
                    <div>
                        <LayersDataTable worldName={world.name} layers={world.layers || []} getAllLayersData={this.getAllLayersData}/>
                    </div>
                    { !this.props.world.layers &&
                    <div>
                        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="#EEEEEE" animationDuration=".5s"/>
                    </div>
                    }
                </div>
                : <Route path="/world/:worldName/layer/:layerName" component={Layer}/>
        );
    };
}

const mapStateToProps = (state: IState, { worldName, match }: any) => ({
    match,
    world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ updateWorld: WorldsActions.updateWorldAction }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorldLayers);

