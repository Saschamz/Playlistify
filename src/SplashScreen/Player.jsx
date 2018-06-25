import React, { Component } from 'react';

import { api } from '../ApiCalls';

export default class Player extends Component {

    componentDidMount() {
        api.init();
    }

    playState(e) {
        e.preventDefault();
    }

    previous() {

    }

    next() {

    }


    render() {
        return (
            <div className="player">
                <div className="player__now-playing">
                <p>Now Playing</p>
                    <div className="player__now-playing__flex">
                        <button
                        className="player__controller" 
                        onClick={this.previous.bind(this)}>
                            &lt;
                        </button>
                        <div className="player__now-playing__flex__title">
                            <h1>{this.props.track}</h1>
                            <h4>{this.props.artist}</h4>
                        </div>
                        <button
                        className="player__controller"  
                        onClick={this.next.bind(this)}>
                            &gt;
                        </button>
                    </div>
                </div>
                <button 
                onClick={this.playState.bind(this)}
                className="player__play-pause">
                    {this.props.playing ? (
                        <span>||</span>
                    ) : (
                        <span>&gt;</span>
                    )}
                    {this.props.playing ? 'Pause' : 'Play'} in App
                </button>
            </div>
        );
    }
}
