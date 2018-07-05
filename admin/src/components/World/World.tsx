import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import WorldLayers from '../WorldLayers/WorldLayers';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { bindActionCreators } from 'redux';
import Title from '../Title/Title';
import { withRouter } from 'react-router-dom';

export interface IWorldComponentProps {
    world: IWorld;
    worldName: string;
}

// check if the world exist in the GeoServer Workspaces and navigate to its home page
const World = ({ world, match, worldName }) => (
    <div>
        <Title title={`${worldName} world`} isExist={Boolean(world)}/>
        {world && <div><WorldLayers worldName={worldName} match={match}/></div>}
    </div>
);

const mapStateToProps = (state: IState, { match }: any) => ({
    match,
    world: state.worlds.list.find(({ name, layers }: IWorld) => match.params.worldName === name),
    worldName: match.params.worldName
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ push }, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(World));