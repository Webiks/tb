import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route } from 'react-router';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { WorldService } from '../../services/WorldService';
import { LayerService } from '../../services/LayerService';
import Layer from '../Layer/Layer';
import LayersDataTable from './LayersDataTable';
import { WorldsActions } from '../../actions/world.actions';
import { ITBAction } from '../../consts/action-types';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { IWorldLayer } from '../../interfaces/IWorldLayer';

export interface IPropsLayers {
    world: IWorld,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

class WorldLayers extends React.Component {
    props: IPropsLayers | any;

    // GET: get all world's layers (from mongo Database)
    componentDidMount() {
        this.setState({ hideSpinner: false } );
        // 1. get the world entity by id
        WorldService.getWorld(this.props.world._id)
            .then((world: IWorld): any => {
                console.log(`WorldLayer: 1. find the world: ${world.name}`);
                world.layers = [];
                if (world.layersId.length > 0){
                    // 2. map over all the layersId array and find each layer by Id
                    return Promise.all(world.layersId.map((layerId : string): Promise<any> => {
                        return LayerService.getLayer(layerId)
                            .then(( layer: IWorldLayer) => {
                                console.log(`WorldLayer: 2. find the layer: ${layer.name}`);
                                world.layers.push(layer);
                            })
                            .catch(error => this.refresh([],[]));
                    }))
                    .then (() => {
                        // 3. update the App store with the worlds' list
                        console.log(`WorldLayer: 3. update the ${world.name}'s world layers...` + world.layers.length);
                        console.log("layersId: " + JSON.stringify(world.layersId));
                        this.refresh(world.layersId, world.layers);
                        console.log("finished to refresh the world...");
                        return world;
                    })
                    .catch(error => {
                        console.error("error update the world!" + error);
                        return this.refresh([],[])
                    });
                } else {
                    world.layersId = [];
                    this.refresh(world.layersId, world.layers);
                    return world;
                }
            })
            .catch(error => {
                console.error("there are no layers!");
                return this.refresh([],[])
            });
    };

    // update the App store and refresh the page
    refresh = (layersId: string[], layers: IWorldLayer[]) => {
        console.log("start refresh...");
        const name = this.props.worldName;
        this.props.updateWorld({ name, layersId, layers });
        this.setState({ hideSpinner: true } );
    };

    render() {
        const { world, match } = this.props;

        return (
            <div>
                {
                    match.isExact
                        ? this.props.world.layers &&
                        <div>
                            <div>
                                <LayersDataTable worldName={world.name} layers={world.layers || []}/>
                            </div>
                        </div>
                        : <Route path="/world/:worldName/layer/:layerName" component={Layer}/>
                }
            </div>
        );
    };
}

const mapStateToProps = (state: IState, { worldName, match }: any) => ({
    match,
    world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
});

const mapDispatchToProps = (dispatch: any) => ({
    updateWorld: (payload: Partial<IWorld>) => dispatch(WorldsActions.updateWorldAction(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(WorldLayers);

