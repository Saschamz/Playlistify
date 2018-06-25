import React, { Component } from 'react';

import Media from './Media';
import Player from './Player';
import Statistics from './Statistics';


export default class SplashScreen extends Component {
    render() {
        return (
            <div>
                <Statistics playlist={this.props.playlist}/>
                <Player track={this.props.track} artist={this.props.artist}/>
                <Media/>
            </div>
        );
    }
}
