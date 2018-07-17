import * as React from 'react';
import { connect } from 'react-redux';
import { IState } from '../../store';
import { IWorld } from '../../interfaces/IWorld';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import { LayerService } from '../../services/LayerService';
import { WorldService } from '../../services/WorldService';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { Dialog } from 'primereact/components/dialog/Dialog';
import { Button } from 'primereact/components/button/Button';

export interface IPropsDelete {
    worlds: IWorld[],
    world: IWorld,
    worldName: string,
    name: string,
    type: string;
    layer?: IWorldLayer,
    refresh: (list: IWorld[] | IWorldLayer[]) => void
}

class DeleteComponent extends React.Component {
    props: IPropsDelete;
    list: IWorld[] | IWorldLayer[];
    refresh = this.props.refresh.bind(this);

    delete = () => {
        if (this.props.layer){
            this.list = this.props.world.layers;
            console.log("delete layer: " + this.props.name);
            LayerService.deleteLayerById(this.props.worldName, this.props.layer.layer)
                .then(response => {
                    console.log("LAYER DATA TABLE: delete layer...");
                    // update the layers' list
                    const layers =
                        this.props.world.layers.filter( worldLayer => worldLayer.layer.name !== this.props.name);
                    this.refresh(layers);
                })
                .catch(error => this.props.refresh([]));
        } else {
            this.list = this.props.worlds;
            console.log("delete world: " + this.props.name);
            WorldService.deleteWorldByName(this.props.worldName)
                .then(res => {
                    const worlds =
                        this.props.worlds.filter( world => world.name !== this.props.worldName);
                    this.refresh(worlds);
                });
        }

    };

    render() {


        const alertFooter = (
            <div>
                <Button label="Yes" icon="pi pi-check" onClick={() => this.delete()} />
                <Button label="No"  icon="pi pi-times" onClick={() => this.refresh(this.list) } />
            </div>
        );

        return (
            <Dialog visible={true} width="350px" modal={true} footer={alertFooter} minY={70}
                    onHide={() => this.props.refresh(this.list)}>
                <b>DELETE</b> {this.props.type} <b>{this.props.name}</b> ?
            </Dialog>
        );
    };
}

const mapStateToProps = (state: IState, { worldName, ...props }: any) => {
    return {
        worlds: state.worlds.list,
        world: state.worlds.list.find(({ name, layers }: IWorld) => worldName === name),
        worldName, ...props
    }
};

export default connect(mapStateToProps)(DeleteComponent);