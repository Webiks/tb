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

export interface IPropsWorldsTable {
    worldsList: IWorld[],
    getWorldsList: () => void;
    setWorlds: (worlds: IWorld[]) => ITBAction
    navigateTo: (layerName: string) => void
}

export interface IStateWorldsTable {
    selectedWorld: any,
    displayDialog: boolean,
    globalFilter: any
}

class WorldsDataTable extends React.Component {

    props: IPropsWorldsTable;
    state: IStateWorldsTable = {
        selectedWorld: null,
        displayDialog: false,
        globalFilter: ''
    };

    // set state to initial state
    setInitState = () => {
        this.setState({
            selectedWorld: null,
            displayDialog: false,
        });
    };

    setDisplayDialog = (value) => this.setState({ displayDialog: value });

    goToSelectedWorld = (e) => {
        this.setState({ selectedWorld: e.data,
                              displayDialog: false });
        this.props.navigateTo(`${e.data.name}`);
    };

    editWorld = (rowData) => {
        this.setState({
            selectedWorld: {...rowData},
            displayDialog: true });
        console.log("edit world...");
    };

    deleteWorld = (rowData) => {
        const confirmation = confirm(`Are sure you want to DELETE ${rowData.name}?`);
        if (confirmation){
            const index = this.findSelectedWorldIndex(rowData);
            console.warn("deleteWorld index: " + index);
            WorldService.deleteWorldByName(rowData.name)
                .then(res => {
                    const worlds = this.props.worldsList.filter( world => world.name !== rowData.name);
                    this.refresh(worlds);
                });
        }
    };

    addNew = () => {
        this.setState({
            selectedWorld: {
                name: 'new'
            },
            displayDialog: true
        });
    };

    findSelectedWorldIndex = (rowData) => {
        return this.props.worldsList.indexOf(rowData);
    };

    // update the state world's list
    update = () => {
        const worlds = [...this.props.worldsList];
        worlds[this.findSelectedWorldIndex(this.state.selectedWorld)] = this.state.selectedWorld;
        this.refresh(worlds);
        console.log("Worlds Home Page: UPDATE..." + JSON.stringify(worlds));
    };

    // update the App store and refresh the page
    refresh = (worlds) => {
        this.props.setWorlds([...worlds]);
        this.setInitState();
        console.log("Worlds Home Page: REFRESH..." + JSON.stringify([...worlds]));
    };

    setGlobalFilter = (e: any) => this.setState({globalFilter: e.target.value});

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

        return  (
            <div className="content-section implementation">
                {this.props.worldsList && <div>
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
                </div>}

                    {this.state.selectedWorld && this.state.displayDialog && <div>
                        <div className="ui-grid ui-grid-responsive ui-fluid" >
                            <WorldEditor worldName={ this.state.selectedWorld.name }
                                         setDisplayDialog={this.setDisplayDialog}
                                         displayDialog={true}
                                         refresh={this.refresh}/>
                        </div>
                    </div>}

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

// header={<DataTableHeader title={'Worlds List'}/>}
