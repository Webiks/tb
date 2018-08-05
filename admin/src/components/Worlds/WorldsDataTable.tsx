import * as React from 'react';
import { IWorld } from '../../interfaces/IWorld';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { IState } from '../../store';
import { WorldsActions } from '../../actions/world.actions';
import { ITBAction } from '../../consts/action-types';
import { WorldService } from '../../services/WorldService';
import DataTableHeader from '../DataTable/DataTableHeader';
import WorldEditor from '../World/WorldEditor';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { DataTable } from 'primereact/components/datatable/DataTable';
import { Column } from 'primereact/components/column/Column';
import { Button } from 'primereact/components/button/Button';
import { Dialog } from 'primereact/components/dialog/Dialog';

export interface IPropsWorldsTable {
    worldsList: IWorld[],
    getWorldsList: () => void;
    setWorlds: (worlds: IWorld[]) => ITBAction
    navigateTo: (layerName: string) => void
}

export interface IStateWorldsTable {
    selectedWorld: any,
    displayEditor: boolean,
    displayAlert: boolean,
    globalFilter: any
}

class WorldsDataTable extends React.Component {

    props: IPropsWorldsTable;
    state: IStateWorldsTable = {
        selectedWorld: null,
        displayEditor: false,
        displayAlert: false,
        globalFilter: ''
    };
    newWorld: boolean = false;

    // set state to initial state
    setInitState = () => {
        this.setState({
            selectedWorld: null,
            displayEditor: false,
            displayAlert: false
        });
    };

    setDisplayEditor = (value) => this.setState({ displayEditor: value });

    setGlobalFilter = (e: any) => this.setState({globalFilter: e.target.value});

    goToSelectedWorld = (e) => {
    this.setState({  selectedWorld: e.data,
                           displayEditor: false,
                           displayAlert: false});
        this.props.navigateTo(`${e.data.name}`);
    };

    editWorld = (rowData) => {
        this.newWorld = false;
        this.setState({
            selectedWorld: {...rowData},
            displayEditor: true,
            displayAlert: false });
        console.log("edit world...");
    };

    deleteWorld = (rowData) => {
        this.setState({
            selectedWorld: {...rowData},
            displayEditor: false,
            displayAlert: true });
        console.log("delete world...");
    };

    delete = () => {
        const index = this.props.worldsList.indexOf(this.state.selectedWorld);
        WorldService.deleteWorld(this.state.selectedWorld)
            .then(res => {
                const worlds =
                    this.props.worldsList.filter( world => world.name !== this.state.selectedWorld.name);
                this.refresh(worlds);
            })
            .catch( error => this.handleError(`Error delete ${this.state.selectedWorld.name}'s world ${error}`));
    };

    addNew = () => {
        this.newWorld = true;
        this.setState({
            selectedWorld: {
                name: ''
            },
            displayEditor: true
        });
    };

    // update the App store and refresh the page
    refresh = (worlds) => {
        this.props.setWorlds([...worlds]);
        this.setInitState();
    };

    handleError = (message) => {
        console.error(message);
        return this.refresh(this.props.worldsList);
    };

    actionsButtons = (rowData: any, column: any) => {
        return (
            <div className="ui-button-icon ui-helper-clearfix" onClick={($event) => $event.stopPropagation()}>
                <Button type="button" icon="fa fa-edit" className="ui-button-warning" style={{margin: '3px 7px'}}
                        onClick={() => this.editWorld(rowData)}/>
                <Button type="button" icon="fa fa-close" style={{margin: '3px 7px'}}
                        onClick={() => this.deleteWorld(rowData)}/>

            </div>
        );
    };

    render(){

        const footer = <div className="ui-helper-clearfix" style={{width:'100%'}}>
            <Button icon="fa fa-plus" label="Add" onClick={this.addNew} style={{margin:'auto'}}/>
        </div>;

        const alertFooter = (
            <div>
                <Button label="Yes" icon="pi pi-check" onClick={() => this.delete()} />
                <Button label="No"  icon="pi pi-times" onClick={() => this.refresh(this.props.worldsList) } />
            </div>
        );

        return  (
            <div className="content-section implementation">
                {
                this.props.worldsList &&
                <div>
                    <DataTable  value={this.props.worldsList} paginator={true} rows={10} responsive={true}
                                resizableColumns={true} autoLayout={true} style={{margin:'10px 20px'}}
                                header={<DataTableHeader title={'Worlds List'} setGlobalFilter={this.setGlobalFilter}/>}
                                footer={footer}
                                globalFilter={this.state.globalFilter}
                                selectionMode="single" selection={this.state.selectedWorld}
                                onSelectionChange={(e: any)=> this.setState({selectedLayer: e.data})}
                                onRowSelect={this.goToSelectedWorld}>
                        <Column field="name" header="Name" sortable={true} style={{textAlign:'left', padding:'7px 20px', width: '20%'}}/>
                        <Column field="country" header="Country"  style={{width: '15%'}}/>
                        <Column field="desc" header="Description" sortable={false}/>
                        <Column header="Actions" body={this.actionsButtons} style={{width: '12%'}} />
                    </DataTable>
                </div>
                }

                {
                this.state.selectedWorld && this.state.displayEditor &&
                <div>
                    <div className="ui-grid ui-grid-responsive ui-fluid" >
                        <WorldEditor worldName={ this.state.selectedWorld.name }
                                     setDisplayEditor={this.setDisplayEditor}
                                     displayDialog={true}
                                     newWorld={this.newWorld}
                                     refresh={this.refresh}/>
                    </div>
                </div>
                }

                {
                this.state.selectedWorld && this.state.displayAlert &&
                <div>
                    <Dialog visible={this.state.displayAlert}
                            width="350px" modal={true} footer={alertFooter} minY={70}
                            onHide={() => this.refresh(this.props.worldsList) }>
                        <b>DELETE</b> world <b>{this.state.selectedWorld.name}</b> ?
                    </Dialog>
                </div>
                }

            </div>
        );
    }
}

const mapStateToProps = (state: IState) => {
    return {
        worldsList: state.worlds.list
    }
};

const mapDispatchToProps = (dispatch: any) => ({
    setWorlds: (payload: IWorld[]) => dispatch(WorldsActions.setWorldsAction(payload)),
    updateWorld: (payload: IWorld) => dispatch(WorldsActions.updateWorldAction(payload)),
    navigateTo: (location: string) => dispatch(push(`/world/${location}`))
});

export default connect(mapStateToProps, mapDispatchToProps)(WorldsDataTable);