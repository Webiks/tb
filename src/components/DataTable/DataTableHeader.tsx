import * as React from 'react';
import { connect } from 'react-redux';
import { IState } from '../../store';

/* Prime React components */
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'font-awesome/css/font-awesome.css';
import { InputText } from 'primereact/components/inputtext/InputText';


export interface IPropsHeader {
    title: string,
    setGlobalFilter: (e:any) => void
}

export interface IStateDetails {
    globalFilter: any
}

class DataTableHeader extends React.Component {
    props: IPropsHeader;
    state = {};

    render() {
        return (
            <header>
                <h2 style={{'textAlign':'center'}}>
                    {this.props.title}
                </h2>
                <div style={{'textAlign':'center'}}>
                    <i className="fa fa-search" style={{margin:'4px 4px 0 0'}}/>
                    <InputText id='search' type="search"
                               onChange={this.props.setGlobalFilter} placeholder="Search" size={30}/>
                </div>
            </header>
        );
    };
}

const mapStateToProps = (state: IState, { title, setGlobalFilter }: any) => ({ title, setGlobalFilter });

export default connect(mapStateToProps)(DataTableHeader);

