import * as React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route } from 'react-router';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import Layer from '../Layer/Layer';
import LayersDataTable from './LayersDataTable';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';

export interface IPropsLayers {
    world: IWorld
}

class WorldLayers extends React.Component {
    props: IPropsLayers | any;

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

export default connect(mapStateToProps)(WorldLayers);

