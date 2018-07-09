import * as React from 'react';

import { LayerService } from '../../services/LayerService';
import { IWorldLayer } from '../../interfaces/IWorldLayer';
import ol from 'openlayers';

export interface IDisplayMapProps  {
    layer: IWorldLayer,
    worldName: string
}

class DisplayMap extends React.Component {

    props: IDisplayMapProps ;

    center: number[] = this.props.layer.data.center;
    parser = new ol.format.WMTSCapabilities();
    projection: string = this.props.layer.data.latLonBoundingBox.crs;
    olProjection: string = 'EPSG:3857';
    map: any;

    // get the Capabilities XML file in JSON format
    componentDidMount(){
        // 1. get the Capabilities XML file
        LayerService.getCapabilities(this.props.worldName, this.props.layer.layer.name)
            .then( xml => {
                console.log("1. get capabilities XML");
                // 2. convert the xml data to json
                const json = this.parser.read(xml);
                console.log("2. convert to JSON");
                // 3. define the map options
                const options = ol.source.WMTS.optionsFromCapabilities(json,
                    {
                        projection: this.props.layer.data.srs,
                        layer: this.props.layer.layer.name,
                        matrixSet: this.projection
                    });
                console.log("3. finished to define the options");

                // draw the map
                console.log("4. draw the OL Map...");
                this.map = new ol.Map({
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM(),
                            opacity: 0.7
                        }),
                        new ol.layer.Tile({
                            opacity: 1,
                            source: new ol.source.WMTS(options)
                        })
                    ],
                    target: 'map',
                    view: new ol.View({
                        projection: this.olProjection,
                        center: ol.proj.transform(this.center, this.projection, this.olProjection),
                        zoom: this.props.layer.inputData.zoom
                    })
                });
            })
            .catch(error => { throw new Error(error) });
    }

    render() {
        return (
            <div className="ui-grid ui-grid-responsive ui-fluid">
                <div id="map" className="map" style={{height:'400px', width:'100%'}}/>
            </div>
        )
    }
}

export default DisplayMap;
