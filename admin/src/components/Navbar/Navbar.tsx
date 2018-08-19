import * as React from 'react';
import './Navbar.css';
import { IState } from '../../store';
import { SetAuth } from '../../actions/login.actions';
import { bindActionCreators } from 'redux';
import LoginService from '../Login/LoginService';
import { Popper, Manager, Target } from 'react-popper';
import { push } from 'react-router-redux';

/* Material-ui components */
import {
    AppBar,
    ClickAwayListener,
    Fade, Grow,
    Icon,
    IconButton,
    Menu,
    MenuItem, MenuList, Paper,
    Toolbar,
    Typography,
    Tooltip
} from '@material-ui/core';
import { Home } from '@material-ui/icons';
import { connect } from 'react-redux';

class Navbar extends React.Component {
    props: any;
    state = { open: false };
    target1;

    logout = () => {
        LoginService.logout()
            .then(() => this.props.SetAuth(false));
    };

    render() {
        const open = Boolean(this.state.open);

        return <AppBar color="primary" >
            <Toolbar className="root">
                {
                    this.props.isAuthenticated ?
                        <Tooltip title="Back to Worlds list">
                            <IconButton id="home" className="menuButton" color="inherit" aria-label="Menu"
                                        onClick={() => this.props.push('/')}>
                                <Home/>
                            </IconButton>
                        </Tooltip>
                        : null
                }
                <Typography variant="title" color="inherit" className="flex">
                    TB
                </Typography>

                {
                    this.props.isAuthenticated ?
                        <div>
                            <Manager>
                                <Target>
                                    <div ref={node => { this.target1 = node; }}>
                                        <Tooltip title="Menu">
                                            <IconButton color="inherit"
                                                        aria-label="Logout"
                                                        aria-owns="menu-user"
                                                        onClick={(event) => this.setState({ open: true })}>
                                                <Icon className="fa fa-user"/>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </Target>
                                <Popper
                                    placement="bottom-start"
                                    eventsEnabled={open}>

                                    <ClickAwayListener onClickAway={() => this.setState({ open: false })}>
                                        <Grow in={open} style={{ transformOrigin: '0 0 0' }}>
                                            <Paper>
                                                <MenuList role="menu">
                                                    <MenuItem onClick={() => this.logout()}>
                                                        Logout
                                                        <IconButton aria-label="Logout">
                                                            <Icon className="fa fa-sign-out"/>
                                                        </IconButton>
                                                    </MenuItem>
                                                </MenuList>
                                            </Paper>
                                        </Grow>
                                    </ClickAwayListener>
                                </Popper>
                            </Manager>
                        </div>

                        : null
                }

            </Toolbar>
        </AppBar>;
    }
}

const mapStateToProps = (state: IState, props: any): any => ({ isAuthenticated: state.login.isAuthenticated });
const mapDispatchToProps = (dispatch: any) => bindActionCreators({ SetAuth, push }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);