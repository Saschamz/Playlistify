import React, { Component } from 'react';

import Media from './Media';
import Player from './Player';
import Statistics from './Statistics';
import { api } from '../ApiCalls';


export default class SplashScreen extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            playlist: null,
            cover: null
        }
    }

    addTracks(uri) {        
        uri += `/tracks?offset=${this.offset}`;
        this.offset += 100;
        api.getPlaylist(this.props.userId, uri)
        .then((res, err) => {
            if(err) console.log(err);
            this.playlist.tracks.items.push(...res.items);
            if(this.playlist.tracks.items.length < res.total) {
                this.addTracks(this.props.playlistId);
            } else {
                this.setState({playlist: this.playlist, cover: this.state.cover});
            }
        });
    }

    componentWillMount() {
        api.init(this.props.token);        
        this.offset = 100;
        this.playlist;

        api.getPlaylist(this.props.userId, this.props.playlistId)
        .then((res, err) => {
            if(err) console.log(err);
            this.playlist = res;

            console.log(res);
            this.spotifyLink = res.uri;
            const cover = `url("${res.images[0].url}")`;
            this.setState({
                playlist: this.state.playlist,
                cover
            });
            
            if(this.playlist.tracks.items.length < res.tracks.total) {
                this.addTracks(this.props.playlistId);
            } else {
                this.setState({playlist: this.playlist, cover: this.state.cover});
            }
        })
    }


    renderComplete() {
        return (
            <div className="splash-screen__grid">
                <Statistics playlist={this.state.playlist}/>
                <Player token={this.props.token} uri={this.props.playlistId} />
                <Media spotifyLink={this.spotifyLink || null} />
                <div className="cover" style={{background: this.state.cover}}>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="splash-screen">
                {this.state.playlist && this.renderComplete()}
            </div>
        );
    }
}
