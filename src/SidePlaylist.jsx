import React, { Component } from 'react';
import { api } from './ApiCalls';

class SidePlaylist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            playlists: []
        };
    }

    componentDidMount() {
        api.init(this.props.token);
        this.updatePlaylist();
        console.log(this.props.nowPlaying);
    }
    
    componentDidUpdate() {
        console.log(this.props.user)
        if(this.props.nowPlaying) {
            let toggle = true;
            this.state.playlists.forEach(item => {
                item.uri === this.props.nowPlaying && (toggle = false); 
            });
            toggle && this.updatePlaylist();
        }        
    }

    updatePlaylist() {
        api.getPlaylists()
        .then((res, err) => {
            if(err) console.error(err);
            else {
                let playlists = res.items;
                this.setState({playlists});
            }
        });
    }

    updatePlaying(e) {
        const uri = e.target.attributes[1].value;
        this.props.updatePlaying(uri);
    }

    render() {
        return (
            <div className="side-playlist">
                <div className="side-playlist__header">
                    <h1 className="spotifind-title">Playlistify</h1>
                    <p className="spotifind-title__subtitle">{this.props.user && this.props.user.id}</p>
                    {/* {this.props.user && this.props.user.images.length > 0 && ( <img src={this.props.user.images[0].url}/> )} */}
                </div>
                <p className="playlists-title">Playlists</p>
                <div className="side-playlist__container">
                {this.state.playlists.length > 0 && this.state.playlists.map((playlist, index) => {
                    const className = `side-playlist__item ${playlist.uri === this.props.nowPlaying && 'active'}`          
                    return (
                        <div className={className} key={index} data-uri={playlist.uri} onClick={this.updatePlaying.bind(this)}>{playlist.name}</div>
                    );
                })}
                </div>
            </div>
        );
    }
}

export default SidePlaylist;