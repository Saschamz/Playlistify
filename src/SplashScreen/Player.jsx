import React, { Component } from 'react';

import { api } from '../ApiCalls';
import FontAwesome from 'react-fontawesome';

export default class Player extends Component {

    constructor(props) {
        super(props);

        this.state = {
            playing: false,
            playingSong: null,
            playingArtist: null,
            shuffle: false,
            context: false,
            isConnectedToDevice: true,
            timeStamp: {
                current: 0,
                total: 0
            },
        }
    }

    componentDidMount() {
        api.init(this.props.token);

        api.getPlayBack()
        .then((res, err) => {
            if(err || !res) {
                this.setState({...this.state, isConnectedToDevice: false});
            } else {
                this.shuffle();
                this.updateComponent();
                this.setState({...this.state, isConnectedToDevice: true});
            }
        })
        .catch(e => console.log(e))

        this.currentUri = this.props.uri;
        this.updatesQueued = 0;
    }

    updateComponent() {
        api.getPlayBack()
        .then((res, err) => {
            if(err || !res) {
                this.setState({...this.state, isConnectedToDevice: false});
            } else {
                let context = this.props.uri === res.context.uri;

                this.coverArt = res.item.album.images[1].url; // 0: 640x640, 1: 300x300, 2: 64x64
    
                let artists = '';
                res.item.artists.forEach(artist => artists += artist.name + ', ');
                artists = artists.trim();
                if(artists[artists.length - 1] === ',') artists = artists.substr(0, artists.length - 1);
                this.setState({
                    playing: res.is_playing,
                    playingSong: res.item.name,
                    playingArtist: artists,
                    shuffle: res.shuffle_state,
                    context,
                    timeStamp: this.state.timeStamp,
                    isConnectedToDevice: true
                });
            }
        })
        .catch(e => console.log(e));
        this.currentUri = this.props.uri;
    }

    componentDidUpdate() {
        if(this.currentUri !== this.props.uri) this.updateComponent();
        else if(document.querySelector('.playing__now-playing-title')) this.state.context && setTimeout(() => {
            if(document.querySelector('.player__now-playing__title').classList.contains('fade-in-bounce')) {
                document.querySelector('.player__now-playing__title').classList.remove('fade-in-bounce');
            }
        }, 700);
    }

    // Plays in spotify app
    play() {
        api.play(!this.state.context && this.props.uri)
        .then((_, err) => {
            if(err) console.log(err);
            this.setState({
                playing: true,
                playingSong: this.state.playingSong,
                playingArtist: this.state.playingArtist,
                shuffle: this.state.shuffle,
                context: true,
                timeStamp: this.state.timeStamp,
                isConnectedToDevice: this.state.isConnectedToDevice
            });
            this.updateInfo(false);
        });
    }

    // Pauses in spotify app
    pause() {
        this.setState({
            playing: false,
            playingSong: this.state.playingSong,
            playingArtist: this.state.playingArtist,
            shuffle: this.state.shuffle,
            context: this.state.context,
            timeStamp: this.state.timeStamp,
            isConnectedToDevice: this.state.isConnectedToDevice
        });

        api.pause()
        .then((_, err) => {
            if(err) console.log(err);
        });
    }

    updateInfo(slide = true) {
        slide && ( document.querySelector('.player__now-playing__title').style.opacity = 0 );
        setTimeout(() => {
            api.getPlayBack()
            .then((res, err) => {
                if(err) console.log(err);
                console.log('RES', res);


            // Temporary solution for auto updating, fix better when implementing time-track
            // Save time in state and render that somewhere without implementing time-track
            let currTime = res.progress_ms;
            const totalTime = res.item.duration_ms;
            if(this.updatesQueued < 1) {
                ++this.updatesQueued;
                this.update = setInterval(() => {
                    if(currTime >= totalTime) {
                        clearInterval(this.update);
                        --this.updatesQueued;
                        this.updateComponent();
                    } else if(this.state.playing){
                        currTime += 1000;
                        console.log(currTime);
                        this.setState({
                            playing: this.state.playing,
                            playingSong: this.state.playingSong,
                            playingArtist: this.state.playingArtist,
                            shuffle: this.state.shuffle,
                            context: this.state.context,
                            isConnectedToDevice: this.state.isConnectedToDevice,
                            timeStamp: {
                                current: Math.round(currTime / 1000),
                                total: Math.round(totalTime / 1000)
                            }
                        });
                    }
                }, 1000)
            }

                let artists = '';
                res.item.artists.forEach(artist => artists += artist.name + ', ');
                artists = artists.trim();
                if(artists[artists.length - 1] === ',') artists = artists.substr(0, artists.length - 1);
    
                this.coverArt = res.item.album.images[1].url; // 0: 640x640, 1: 300x300, 2: 64x64

                this.setState({
                    playing: this.state.playing,
                    playingSong: res.item.name,
                    playingArtist: artists,
                    shuffle: res.shuffle_state,
                    context: this.state.context,
                    isConnectedToDevice: this.state.isConnectedToDevice
                });

                slide && this.slideTitle();
            })
        }, 200);
    }

    // Skips to previous track in spotify app
    previous() {
        api.previousTrack()
        .then((_, err) => {
            if(err) console.log(err);
            this.updatesQueued = 0;
            clearInterval(this.update);

            this.setState({
                playing: true,
                playingSong: this.state.playingSong,
                playingArtist: this.state.playingArtist,
                shuffle: this.state.shuffle,
                context: this.state.context,
                timeStamp: this.state.timeStamp,
                isConnectedToDevice: this.stateisConnectedToDevice
            });
            this.updateInfo();
        });
    }

    // Skips to next track in spotify app
    next() {
        api.nextTrack()
        .then((res, err) => {
            if(err) console.log(err);
            this.updatesQueued = 0;
            clearInterval(this.update);
            
            this.setState({
                playing: true,
                playingSong: this.state.playingSong,
                playingArtist: this.state.playingArtist,
                shuffle: this.state.shuffle,
                context: this.state.context,
                timeStamp: this.state.timeStamp,
                isConnectedToDevice: this.state.isConnectedToDevice
            });
            this.updateInfo();
        });
    }

    // Toggles shuffle state in spotify app
    shuffle() {
        this.setState({
            playing: this.state.playing,
            playingSong: this.state.playingSong,
            playingArtist: this.state.playingArtist,
            shuffle: !this.state.shuffle,
            context: this.state.context,
            timeStamp: this.state.timeStamp,
            isConnectedToDevice: this.state.isConnectedToDevice
        });

        api.shuffle(true)
        .then((_, err) => {
            if(err) console.log(err);
        });
    }

    renderControllers() {
        const className = `player__play-state fade-in-bounce ${!this.state.context && 'no-context'}`;
        let jsx = (
            <div className="player__controllers">

                {
                    this.state.context && (
                        <button
                            className="player__controller fade-in-bounce" 
                            onClick={this.previous.bind(this)}>
                            <FontAwesome name='backward'/>
                        </button>
                    )
                }

                {this.state.playing && this.state.context ? (
                    <button 
                    onClick={this.pause.bind(this)}
                    className={className + ' pause-button'}>
                        <FontAwesome name='pause'/>
                    </button>
                    ) : (
                    <button 
                    onClick={this.play.bind(this)}
                    className={className + ' play-button'}>
                        <FontAwesome name='play'/>
                    </button>
                )}

                {
                    this.state.context && (
                        <button
                            className="player__controller fade-in-bounce"  
                            onClick={this.next.bind(this)}>
                            <FontAwesome name='forward'/>
                        </button> 
                    )
                }
            </div>
        );

        return jsx;
    }

    slideTitle() {
        document.querySelector('.player__now-playing__title').style.opacity = 0;
        document.querySelector('.player__now-playing__title').classList.remove('slide');
        setTimeout(() => document.querySelector('.player__now-playing__title').classList.add('slide'), 20);
    }

    renderErrorMsg(msg) {
        return(<h1 className="error-msg">{msg}</h1>);
    }
    

    render() {
        return (
            <div className="player">
                <div className="player__container">
                    <div className="player__now-playing">
                    {
                        this.state.context && (
                            <div className="player__now-playing__container">
                            <div className="player__cover-art fade-in-bounce" style={{background: `url('${this.coverArt || null}')`}}>
                                <span className="timestamp">
                                    <input type="range" value={this.state.timeStamp.current} max={this.state.timeStamp.total}/>
                                </span>
                            </div>
                                <p className="fade-in-bounce">Now Playing</p>
                                <div className="player__now-playing__title fade-in-bounce">
                                    <h1>{this.state.playingSong}</h1>
                                    <h4>{this.state.playingArtist}</h4>
                                </div>
                            </div>
                        )
                    }
                    </div>
                    {!this.props.premiumUser && this.renderErrorMsg('Premium account required to access browser player.')}
                    {
                        this.state.isConnectedToDevice &&
                        this.props.premiumUser ? this.renderControllers() :
                        this.renderErrorMsg('Open spotify app if you want to play directly from browser')
                    }
                </div>
            </div>
        );
    }
}
