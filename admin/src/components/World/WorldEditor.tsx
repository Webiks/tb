import * as React from 'react';
import { cloneDeep, get } from 'lodash';
import { updatedDiff } from 'deep-object-diff';
import { IWorld } from '../../interfaces/IWorld';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { IState } from '../../store';
import { ITBAction } from '../../consts/action-types';
import { WorldsActions } from '../../actions/world.actions';
import { WorldService } from '../../services/WorldService';
/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { Button } from 'primereact/components/button/Button';
import { InputText } from 'primereact/components/inputtext/InputText';
import { Dialog } from 'primereact/components/dialog/Dialog';
import { Growl } from 'primereact/components/growl/Growl';

export interface IPropsWorld {
    displayDialog: boolean,
    worldsList: IWorld[],
    worldName: string,
    world: IWorld,
    newWorld: boolean,
    refresh: (worlds: IWorld[]) => void,
    setDisplayEditor: (value: boolean) => void,
    updateWorld: (worlds: Partial<IWorld>) => ITBAction
}

export interface IStateDetails {
    world: IWorld,
    displayAlert: boolean,
    globalFilter?: any;
}

class WorldEditor extends React.Component {
    props: IPropsWorld;
    state: IStateDetails;

    worldIndex: number;
    growl: any;

    componentWillMount() {
        this.setState({ displayAlert: false });
        if (this.props.newWorld) {
            this.setState({
                displayDialog: true,
                world: {
                    _id: '',
                    name: '',
                    password: '',
                    desc: '',
                    country: '',
                    layers: []
                }
            });
        } else {
            this.setState({
                displayDialog: true,
                world: cloneDeep(this.props.world),
                worldName: this.props.worldName,
                worldsList: this.props.worldsList
            });
            this.worldIndex = this.props.worldsList.indexOf(this.props.world);
        }
    }

    // save the App state when the field's value is been changed
    updateProperty(property: string, value: any) {
        const world = { ...this.state.world };
        world[property] = value;
        this.setState({ world });
    }

    isNameExist = (name: string): any => {
        // check if the name exists in the worldName list or in the Id's list
        return (this.props.worldsList.find(world => world.name === name || world._id === name));
    };

    isPasswordExist = (password: string): any => {
        // check if the password exists in the worlds list
        return (this.props.worldsList.find(world => world.password === password));
    };

    // save the changes in the App store and the DataBase
    save = () => {
        console.log('WorldEditor: start save world...', this.props.newWorld);
        const worlds = [...this.props.worldsList];
        // if new - create a new world
        if (this.props.newWorld) {
            // 1. check the name: if was given and if it is unique
            if (this.state.world.name === '') {
                this.showError('you must fill the name!');
            } else {
                if (!this.isNameExist(this.state.world.name)) {
                    // 2. check the password: if was given and if it is unique
                    if (this.state.world.password === '') {
                        this.showError('you must fill the password!');
                    } else {
                        if (!this.isPasswordExist(this.state.world.password)) {
                            WorldService.createWorld(this.state.world)
                                .then(res => {
                                    console.log('create new world: ', JSON.stringify(res));
                                    worlds.push(res);
                                    this.refresh(worlds);
                                });
                        } else {
                            this.showError('please Give another password!');
                        }
                    }
                } else {
                    this.showError('please Give another name!');
                }
            }

            // else - update an existing world
        } else {
            worlds[this.worldIndex] = this.state.world;
            // if the name was changed - check if there is no other world with the same name
            if (this.state.world.name !== this.props.world.name) {
                if (this.isNameExist(this.state.world.name)) {
                    this.showError('please Give another name!');
                } else {
                    // continue to update the changed world
                    this.saveWorlds(worlds);
                }
            }
            // if the password was changed - check if there is no other world with the same password
            else if (this.state.world.password !== this.props.world.password) {
                if (this.isPasswordExist(this.state.world.password)) {
                    this.showError('please Give another password!');
                } else {
                    // continue to update the changed world
                    this.saveWorlds(worlds);
                }
            } else {
                this.saveWorlds(worlds);
            }
        }
    };

    // update the changed world in the Database and then in the App store
    saveWorlds = (worlds) => {
        const updateWorld = updatedDiff(this.props.world, this.state.world);
        // if more then one field has changed - update the whole world object
        if (Object.keys(updateWorld).length > 1) {
            console.warn('SAVE: update world : ' + this.props.worldName);
            WorldService.updateWorld(this.props.world, this.state.world)
                .then(res => {
                    console.warn(`Succeed to update ${res.name} world`);
                    this.refresh(worlds);
                })
                .catch(error => this.handleError(error));
            // else - update only the changed field
        } else {
            const fieldName = Object.keys(updateWorld)[0];
            const fieldValue = updateWorld[fieldName];
            WorldService.updateWorldField(this.props.world, fieldName, fieldValue)
                .then(res => {
                    console.warn('Succeed to update ' + fieldName + ' field: ');
                    this.refresh(worlds);
                })
                .catch(error => this.handleError(error));
        }
    };

    // update the App store World's list and refresh the page
    refresh = (worlds: IWorld[]) => {
        this.props.setDisplayEditor(false);
        this.props.refresh(worlds);
    };

    // an ERROR massage - if the suggested world's name is already exists
    showError(message) {
        this.growl.show({
            severity: 'error', summary: 'Error Message', life: 8000,
            detail: message
        });
    }

    handleError = (error) => {
        console.error(`Failed to update ${this.props.world.name} world: ${error}`);
        return this.refresh(this.props.worldsList);
    };

    render() {

        const editorFooter =
            <div className="ui-dialog-buttonpane ui-helper-clearfix">
                <Button label="Reset" icon="fa fa-undo" onClick={this.componentWillMount.bind(this)}
                        style={{ padding: '5px 10px', width: '15%', float: 'left' }}/>
                <Button label="Save" icon="fa fa-check" onClick={this.save}
                        style={{ padding: '5px 10px', width: '15%' }}/>
            </div>;

        return (
            <div>
                <div className="content-section implementation ui-fluid">
                    <Growl ref={(el) => this.growl = el} position="bottomleft"/>
                </div>

                <Dialog visible={this.props.displayDialog} modal={true}
                        header={`${this.props.worldName} World Details`}
                        footer={editorFooter}
                        responsive={true} style={{ width: '50%' }}
                        onHide={() => this.refresh(this.props.worldsList)}>
                    {this.state.world && <div className="content-section implementation"
                                              style={{ textAlign: 'left', width: '100%', margin: 'auto' }}>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ padding: '4px 10px' }}><label htmlFor="name">World
                                Name</label></div>
                            <div className="ui-grid-col-8" style={{ padding: '4px 10px' }}>
                                <InputText id="name" required={true} requiredmessage="a name is must be given!"
                                           value={this.state.world.name}
                                           placeholder={'world name - required!'}
                                           onChange={(e: any) => {
                                               this.updateProperty('name', e.target.value);
                                           }}/>
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ padding: '4px 10px' }}><label
                                htmlFor="password">Password</label></div>
                            <div className="ui-grid-col-8" style={{ padding: '4px 10px' }}>
                                <InputText type="password" id="name" required={true}
                                           requiredmessage="a password is must be given!"
                                           value={this.state.world.password}
                                           placeholder={'password - required!'}
                                           onChange={(e: any) => {
                                               this.updateProperty('password', e.target.value);
                                           }}/>
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ padding: '4px 10px' }}><label
                                htmlFor="country">Country</label></div>
                            <div className="ui-grid-col-8" style={{ padding: '4px 10px' }}>
                                <InputText id="country"
                                           value={this.state.world.country}
                                           placeholder={'country'}
                                           onChange={(e: any) => {
                                               this.updateProperty('country', e.target.value);
                                           }}/>

                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ padding: '4px 10px' }}><label
                                htmlFor="desc">Description</label></div>
                            <div className="ui-grid-col-8" style={{ padding: '4px 10px' }}>
                                <InputText id="desc"
                                           value={this.state.world.desc}
                                           placeholder={'description of the world'}
                                           onChange={(e: any) => {
                                               this.updateProperty('desc', e.target.value);
                                           }}/>
                            </div>
                        </div>
                        <div className="ui-grid-row">
                            <div className="ui-grid-col-4" style={{ padding: '4px 10px' }}><label htmlFor="worldId">World
                                ID</label></div>
                            <div className="ui-grid-col-8" style={{ padding: '4px 10px' }}>
                                <InputText id="worldId"
                                           value={this.state.world._id}
                                           readOnly={true}/>
                            </div>
                        </div>
                    </div>}
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: IState, { worldName, ...props }: any) => {
    return {
        ...props, worldName,
        worldsList: state.worlds.list,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name)
    };
};
const mapDispatchToProps = (dispatch: any) => bindActionCreators({ updateWorld: WorldsActions.updateWorldAction }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(WorldEditor);