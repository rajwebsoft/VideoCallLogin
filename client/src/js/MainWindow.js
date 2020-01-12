/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import PropTypes from 'proptypes';
import socket from './socket';

let friendID;
class MainWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
          isLogin: false,
          isError: 0,
          loginInfo: {},
          friendList: []
        };
        this.loginUser = this.loginUser.bind(this);
    }

    onChangeData(key, value) {
        this.setState({ [key]: value });
    }

    componentDidMount() {
        socket.on('userLoginRes', (data) => { 
            if(data.status == '1') {
                this.setState({ isError: 0, isLogin: true, loginInfo: data.info });
            }else{
                this.setState({ isError: 1 });
            }
        });

        socket.on('friendLoginRes', (frdata) => { 
            this.setState({ friendList: frdata });
        });

        
    }

    loginUser(event) {
        if (event) {
            event.preventDefault();
            socket.emit('userLogin', { username:this.state.username, password: this.state.password});
        }
    }

    /*callWithVideo(video) {
        const config = { audio: true };
        config.video = video;
        return () => this.props.startCall(true, friendID, config);
    }*/

    callWithVideo(video, friendIDS) {
        const config = { audio: true };
        config.video = video;
        return () => this.props.startCall(true, friendIDS, config);
    }

    render() {
        const { clientId } = this.props;
        document.title = `${clientId} - Video Audio Call`;
        return (
        <div className="container main-window">
            <React.Fragment>
            {this.state.isLogin === true?(
                <div>
                    <div>
                        <h3>Hi, your Name is <input type="text" className="txt-clientId" value={this.state.loginInfo.name} /></h3>
                        <h4>Get started by calling a friend below</h4>
                        {this.state.friendList.map((item, index)=> (
                            <React.Fragment>
                                {(item.id==clientId)?'':(
                                    <div class="rowline">
                                        <div> {item.name}</div>
                                        <div>
                                            <button className="btn-action fa fa-video-camera" onClick={this.callWithVideo(true,item.id)} />
                                            <button className="btn-action fa fa-phone" onClick={this.callWithVideo(false,item.id)} />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ):(
            <div class="loginblock">
                <div class="login-forms">
                        {this.state.isError==1?(<div class="errmsg">User name password Invalid</div>):('')}
                        <h2 class="login-title">Login</h2>
                        <div class="form-group">
                            <input type="text" class="txt-field" placeholder="User Name" onChange={event => this.onChangeData("username", event.target.value)}  />
                        </div>
                        <div class="form-group">
                            <input type="password" class="txt-field" placeholder="Your Password *" onChange={event => this.onChangeData("password", event.target.value)}  />
                        </div>
                        <div class="form-group">
                            <input type="submit" class="btn btn-primary btnSubmit" disabled={(this.state.username==='' || this.state.username===undefined || this.state.password==='' || this.state.password===undefined)} value="Login" onClick={event => this.loginUser(event)} />
                        </div>
                </div>
            </div>
            )}
            </React.Fragment>
        </div>
        );
    }
}

MainWindow.propTypes = {
  clientId: PropTypes.string.isRequired,
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
