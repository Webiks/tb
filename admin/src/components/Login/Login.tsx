import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { SetAuth } from '../../actions/login.actions';
import { IState } from '../../store';
import { bindActionCreators } from 'redux';
import LoginService from './LoginService';
import { Button, FormControl, Icon, IconButton, Input, InputAdornment, InputLabel } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import 'font-awesome/css/font-awesome.css';

class Login extends React.Component {
    state = { username: '', password: '', error: false, showPassword: false };
    props: any;

    onSubmit($event) {
        $event.preventDefault();
        LoginService.login(this.state.username, this.state.password)
            .then(() => {
                this.props.SetAuth(true);
            })
            .catch(() => this.setState({ error: true }));
    }

    handleChange = prop => event => {
        this.setState({ [prop]: event.target.value, error: false });
    };


    handleMouseDownPassword = event => {
        event.preventDefault();
    };

    handleClickShowPassword = () => {
        this.setState((state: any) => ({ showPassword: !state.showPassword }));
    };

    render() {
        return this.props.isAuthenticated ? <Redirect to={{ pathname: '/', state: { from: this.props.location } }}/> :
            <div>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <FormControl>
                        <InputLabel htmlFor="username">Username</InputLabel>
                        <Input
                            id="username"
                            value={this.state.username}
                            error={this.state.error}
                            onChange={this.handleChange('username')}
                            endAdornment={<InputAdornment position="end">

                                <IconButton disabled={true}>
                                    <Icon className="fa fa-user"/>
                                </IconButton>


                            </InputAdornment>}
                            inputProps={{
                                'aria-label': 'Weight'
                            }}
                        />
                    </FormControl>

                    <br/><br/>

                    <FormControl>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            id="password"
                            type={this.state.showPassword ? 'text' : 'password'}
                            value={this.state.password}
                            onChange={this.handleChange('password')}
                            error={this.state.error}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleClickShowPassword}
                                        onMouseDown={this.handleMouseDownPassword}
                                    >
                                        {this.state.showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>

                    <br/>

                    <FormControl>
                        <Button variant="raised" type="submit" style={{ margin: 15 }} color="primary">Log In</Button>
                    </FormControl>
                </form>

            </div>;
    }

}

const mapStateToProps = (state: IState, props: any): any => ({
    location: state.router.location,
    isAuthenticated: state.login.isAuthenticated
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ SetAuth }, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
