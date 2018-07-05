import * as React from 'react';
import { IWorld } from '../../interfaces/IWorld';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IState } from '../../store';
import { ITBAction } from '../../consts/action-types';
import { WorldsActions } from '../../actions/world.actions';
import { WorldService } from '../../services/WorldService';
import { cloneDeep, get } from 'lodash';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { Button } from 'primereact/components/button/Button';
import { InputText } from 'primereact/components/inputtext/InputText';
import { Dialog } from 'primereact/components/dialog/Dialog';

export interface IPropsWorld {
    displayDialog: boolean,
    worldsList: IWorld[],
    worldName: string,
    world: IWorld,
    refresh: (worlds: IWorld[]) => void,
    setDisplayDialog: (value: boolean) => void,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IStateDetails {
    world: IWorld,
    globalFilter?: any;
}

class WorldEditor extends React.Component {
    props: IPropsWorld;
    state: IStateDetails;
    newWorld: boolean;

    componentWillMount() {
        if (this.props.worldName === 'new'){
            this.newWorld = true;
            this.setState({
                displayDialog: true,
                world: {
                    name: 'new',
                    desc: '',
                    country: '',
                    directory: '',
                    layers: []
                }
            });
        } else {
            this.newWorld = false;
            this.setState({
                displayDialog: true,
                world: cloneDeep(this.props.world),
                worldName: this.props.worldName,
                worldsList: this.props.worldsList });
        }
    }

    findSelectedWorldIndex() {
        return this.props.worldsList.indexOf(this.props.world);
    };

    // save the App state when the field's value is been changed
    updateProperty(property, value) {
        const world = {...this.state.world};
        world[property] = value;
        this.setState({ world });
    }

    // save the changes in the App store
    save = () => {
        const worlds = [...this.props.worldsList];
        if (this.newWorld){
            WorldService.createWorld(this.state.world.name)
                .then (res => {
                    worlds.push(this.state.world);
                    this.refresh(worlds);
                });
        } else {
            worlds[this.findSelectedWorldIndex()] = this.state.world;

            // if the name was changed - update the workspace in geoserver
            if (this.props.worldName !== this.state.world.name){
                console.warn("SAVE: prev Name: " + this.props.worldName);
                WorldService.updateWorld(this.props.worldName, this.state.world.name)
                    .then ( res =>  {
                        console.warn('Succeed to update worlds: ' + JSON.stringify(res));
                        this.refresh(worlds);
                    })
                    .catch( error => console.error('Failed to update worlds: ' + JSON.stringify(error.message)));
            } else {
                this.refresh(worlds);
            }
        }
    };

    // update the App store World's list and refresh the page
    refresh = (worlds: IWorld[]) => {
        this.props.setDisplayDialog(false);
        this.props.refresh(worlds);
    };

    render() {

        const editorFooter =
            <div className="ui-dialog-buttonpane ui-helper-clearfix">
                <Button label="Reset" icon="fa fa-undo" onClick={this.componentWillMount.bind(this)} style={{ padding: '5px 10px', width: '15%', float: 'left' }}/>
                <Button label="Save" icon="fa fa-check" onClick={this.save} style={{ padding: '5px 10px', width: '15%'}}/>
            </div>;

        return (
            <Dialog visible={this.props.displayDialog} modal={true}
                    header={`${this.props.worldName} World Details`}
                    footer={editorFooter}
                    responsive={true} style={{width:'50%'}}
                    onHide={() => this.refresh(this.props.worldsList) }>

                {this.state.world && <div   className="content-section implementation"
                                            style={{ textAlign: 'left', width: '100%', margin: 'auto' }}>
                    <div className="ui-grid-row">
                        <div className="ui-grid-col-4" style={{padding:'4px 10px'}}><label htmlFor="name">World Name</label></div>
                        <div className="ui-grid-col-8" style={{padding:'4px 10px'}}>
                            <InputText id="name" onChange={(e: any) => {this.updateProperty('name', e.target.value)}} value={this.state.world.name}/>
                        </div>
                    </div>
                    <div className="ui-grid-row">
                        <div className="ui-grid-col-4" style={{padding:'4px 10px'}}><label htmlFor="country">Country</label></div>
                        <div className="ui-grid-col-8" style={{padding:'4px 10px'}}>
                            <InputText id="country" onChange={(e: any) => {this.updateProperty('country', e.target.value)}} value={this.state.world.country}/>
                        </div>
                    </div>
                    <div className="ui-grid-row">
                        <div className="ui-grid-col-4" style={{padding:'4px 10px'}}><label htmlFor="desc">Description</label></div>
                        <div className="ui-grid-col-8" style={{padding:'4px 10px'}}>
                            <InputText id="desc" onChange={(e: any) => {this.updateProperty('desc', e.target.value)}} value={this.state.world.desc}/>
                        </div>
                    </div>
                    <div className="ui-grid-row">
                        <div className="ui-grid-col-4" style={{padding:'4px 10px'}}><label htmlFor="directory">Directory</label></div>
                        <div className="ui-grid-col-8" style={{padding:'4px 10px'}}>
                            <InputText id="directory" onChange={(e: any) => {this.updateProperty('directory', e.target.value)}} value={this.state.world.directory}/>
                        </div>
                    </div>
                </div>}
            </Dialog>
        )
    }

}

const mapStateToProps = (state: IState, { worldName, ...rest }: any) => {
    return {
        ...rest, worldName,
        worldsList: state.worlds.list,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name),
    }
};

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ updateWorld: WorldsActions.updateWorldAction }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(WorldEditor);
