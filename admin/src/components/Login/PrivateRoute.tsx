import * as React from 'react';
import { Redirect, Route, withRouter } from 'react-router-dom';
import { IState } from '../../store';
import { connect } from 'react-redux';

class PrivateRoute extends React.Component {
    props: any;

    routeRender = () => {
        const { component: Component, login, location } = this.props;
        const redirectTag = <Redirect to={{ pathname: '/login', state: { from: location } }}/>;
        const loadedTag = <div> Loading... </div>;
        const notAuth = !login.loaded ? loadedTag : redirectTag;
        return login.isAuthenticated ? (<Component/>) : notAuth;
    };

    render() {
        const { component, isAuthenticated, ...rest } = this.props;
        return (
            <Route {...rest} render={this.routeRender}/>
        );
    }

}

const mapStateToProps = (state: IState, props: any): any => ({
    ...props,
    login: state.login
});

export default withRouter(connect(mapStateToProps)(PrivateRoute));

