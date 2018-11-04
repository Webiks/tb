import * as React from 'react';

import { connect } from 'react-redux';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import LayerEditor from './LayerEditor';
import Title from '../Title/Title';

export interface ILayerComponentProps  {
    selectedLayer: IWorldLayer,
    world: IWorld;
    worldName: string,
    layerName: string,
    push: any
}

// check if the layer exist in the GeoServer Layers of this world and navigate to the layer editor page
const Layer = ({ worldName, world, layerName, selectedLayer, push }: ILayerComponentProps) => (
    <div>
        <Title title={`${layerName} layer`} isExist={Boolean(selectedLayer)}/>
        <div>
            { selectedLayer && <LayerEditor worldName={worldName} layer={selectedLayer}/> }
        </div>
    </div>
);
const mapStateToProps = (state: IState, { match }:any ) => {
    const world: IWorld = state.worlds.list.find(({ name, layers }: IWorld) => match.params.worldName === name);
    const selectedLayer: IWorldLayer = world.layers.find(( { name } : IWorldLayer) => match.params.layerName === name);
    return {
        world,
        selectedLayer,
        layerName:  match.params.layerName,
        worldName: match.params.worldName
    }
};
export default connect(mapStateToProps)(Layer);