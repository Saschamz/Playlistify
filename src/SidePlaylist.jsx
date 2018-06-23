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
        document.querySelector('.svg__spotify--stripes').classList.add('svg__spotify--stripes--loading');
        const uri = e.target.attributes[1].value;
        this.props.updatePlaying(uri);
    }

    handleWeekly(e) {
        e.preventDefault();

        document.querySelector('.svg__spotify--stripes').classList.add('svg__spotify--stripes--loading');

        // Create playlist
        api.createPlaylist(this.props.user.id, 'Weekly')
        .then((res, err) => {
            if(err) console.log(err);
            else {
                api.weeklyAlgorithm(this.props.user.id, res.uri);
                setTimeout(() => {
                    this.props.updatePlaying(res.uri)
                }, 2000);
            }
        })

        // Update cooldown
        let cooldown = Date.now();
        localStorage.setItem('weeklyCooldown', JSON.stringify(cooldown));

        // Animate out button
        let weekly = document.querySelector('.weekly');
        weekly.classList.add('weekly--bye');
    }

    weeklyButton() {
        // Get cooldown
        let cooldown = JSON.parse(localStorage.getItem('weeklyCooldown')) || localStorage.setItem('weeklyCooldown', JSON.stringify(0));
        !cooldown && ( cooldown = 0 );
        const isOnCd = cooldown >= ( Date.now() - 7*24*3600*1000 );

        // If !isOnCd render button
        if(!isOnCd) {
            return (
                <div className="weekly"><button className="weekly-button" onClick={this.handleWeekly.bind(this)}>Create weekly playlist</button></div>
            );
        }
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
                {this.weeklyButton()}
            </div>
        );
    }
}

export default SidePlaylist;