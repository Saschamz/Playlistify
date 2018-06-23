import React, { Component } from 'react';

import PlayListGenerator from './PlayListGenerator';
import SidePlaylist from './SidePlaylist';

import { api } from './ApiCalls';

export default class FullView extends Component {

    constructor(props){
        super(props);
        this.state = {
            playing: null,
            user: null,
            expanded: false
        }
    }

    componentDidMount() {
        api.init(this.props.token);
        api.userInformation()
        .then((res, err) => {
            if(err) console.log(err);
            else this.setState({playing: this.state.playing, user: res});
        });
        this.transition = 300;
    }

    componentDidUpdate() {
        this.state.playing && !this.state.expanded && this.contract();
    }

    contract() {
        const algorithms = document.querySelector('.algorithm-choices');
        const search = document.querySelector('.input-field');
        const expand = document.querySelector('.expand-button');
        const playlist = document.querySelector('.playlist');
        algorithms.style.height = '0px';
        playlist && ( setTimeout(() =>playlist.style.transform = 'translateY(calc(100% + 60px))', this.transition * 2) );
        setTimeout(() => search.style.transform = 'translateY(-100%)', this.transition);
        setTimeout(() => expand.style.transform = 'translateY(0%)', this.transition * 2);
        this.setState({playing: this.state.playing, user: this.state.user, expanded: true});
    }

    expand() {
        const algorithms = document.querySelector('.algorithm-choices');
        const search = document.querySelector('.input-field');
        const expand = document.querySelector('.expand-button');
        const playlist = document.querySelector('.playlist');
        expand.style.transform = 'translateY(-100%)';
        setTimeout(() => search.style.transform = 'translateY(0%)', this.transition);
        setTimeout(() => algorithms.style.height = '92px', this.transition * 2);
        playlist.style.transform = 'translateY(100%)';
        //272px
    }

    nowPlaying(playlist) {
        this.setState({playing: playlist, user: this.state.user, expanded: false});
    }

    render() {
        return (
            <div className="layout__grid">
                
                <SidePlaylist 
                token={this.props.token}
                user={this.state.user} 
                nowPlaying={this.state.playing}
                updatePlaying={this.nowPlaying.bind(this)}/>
                
                <PlayListGenerator 
                token={this.props.token}
                user={this.state.user}
                nowPlaying={this.state.playing} 
                updatePlaying={this.nowPlaying.bind(this)}/>

                <span/>
                <button type="button" className="expand-button" onClick={this.expand.bind(this)}>
                    Expand
                </button>
            </div>
        );
    }
}