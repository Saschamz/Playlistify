import React, { Component } from 'react';

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
        this.playlistUri = this.props.playlistId;

        api.getPlaylist(this.props.userId, this.props.playlistId)
        .then((res, err) => {
            if(err) console.log(err);
            this.playlist = res;

            console.log(res);
            this.spotifyLink = res.uri;
            this.clipboard = res.external_urls.spotify;
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
        });
    }

    componentDidUpdate() {
        if(this.playlistUri !== this.props.playlistId) {
            this.offset = 100;
            this.playlist;
            this.playlistUri = this.props.playlistId;

            api.getPlaylist(this.props.userId, this.props.playlistId)
            .then((res, err) => {
                if(err) console.log(err);
                this.playlist = res;
    
                console.log(res);
                this.spotifyLink = res.uri;
                this.clipboard = res.external_urls.spotify;
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
            });
        }
    }

    randomGradient() {
        // Old "preset" gradient generator
        // let availableColors = ['red', 'blue', 'green', 'orange', 'yellow', 'purple', 'cyan', 'teal', 'pink'];
        // let firstColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        // availableColors.splice(availableColors.indexOf(firstColor), 1);
        // let secondColor = availableColors[Math.floor(Math.random() * availableColors.length)];
        const gradient = this.randomizeGradient({saturation: 100});

        typeof this.lock === 'undefined' && ( this.lock = false );

        console.log('lock is: ', this.lock)
        if(!this.lock) {
            this.lock = true;
            this.currGradient = gradient;
            setTimeout(() => {
                this.lock = false;
            }, 500); 
            return gradient;
        } else {
            return this.currGradient;
        }
            
    }

    randomizeGradient(options) {
  
        // Default values
        const stopsDefault = 2;
        const hueDefault = {min: 0, max: 255};
        const saturationDefault = 80;
        const lightnessDefault = 60;
        const directionDefault = 'to bottom';
        const alphaDefault = 1;
        
        // Options handling
        if(!options) {
          options = {
          stops: stopsDefault,
          hue: {min: hueDefault.min, max: hueDefault.max},
          saturation: saturationDefault,
          lightness: lightnessDefault,
          direction: directionDefault,
          alpha: alphaDefault
        }} else {
          !options.stops && ( options.stops = stopsDefault );
          !options.hue && ( options.hue = {min: hueDefault.min, max: hueDefault.max} );
          !!options.hue && ( !options.hue.min || !options.hue.max ) && (
            options.hue = {min: hueDefault.min, max: hueDefault.max}
          );
          !options.saturation && ( options.saturation = saturationDefault );
          !options.direction && ( options.direction = directionDefault );
          !options.lightness && ( options.lightness = lightnessDefault );
          !options.alpha && ( options.alpha = alphaDefault );
        }
        
        // Generate colors
        const colors = [];
        const usedHues = [];
        for(let i = 0; i < options.stops; i++) {
          let hue = Math.floor( Math.random() * (options.hue.max - options.hue.min + 1) + options.hue.min );
          usedHues.forEach(usedHue => {
            const hueDiff = Math.abs(hue - usedHue);
            if(hueDiff < 60 ) ( hue >= usedHue && ( hue += 60 ) ) || ( hue < usedHue && ( hue -= 60 ) );
          });
          colors.push(`hsla(${hue}, ${options.saturation}%, ${options.lightness}%, ${options.alpha})`);
          usedHues.push(hue);
        }
        
        // Return full gradient string
        const gradient = `linear-gradient(${options.direction}, ${colors.join(', ')})`;
        return gradient;
      }


    renderComplete() {
        return (
            <div className="splash-screen__grid">
                <Statistics playlist={this.state.playlist} spotifyLink={this.spotifyLink} clipboard={this.clipboard}/>
                <Player token={this.props.token} uri={this.props.playlistId} premiumUser={this.props.premiumUser}/>
                <div className="cover" style={{background: this.randomGradient()}}>
                    <div className="cover" style={{background: this.state.cover}}></div>
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
