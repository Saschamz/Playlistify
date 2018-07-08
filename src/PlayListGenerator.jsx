import React, { Component } from 'react';
import { svg } from './Svg';
import { api } from './ApiCalls';
import SplashScreen from './SplashScreen/SplashScreen';

export default class PlayListGenerator extends Component {

    constructor(props) {
        super(props);

        this.state = {
            userInformation: null,
            playlistLoading: false,
            playlistReady: false,
            playlistUri: null,
            algorithm: 'sibling'
        };
    }

    componentDidMount() {
        api.init(this.props.token);
        api.userInformation()
        .then((res, err) => {
            if(err) console.log(err);
            else this.setState({userInformation: res, playlistLoading: this.state.playlistLoading, 
                playlistReady: this.state.playlistReady, playlistUri: this.state.playlistUri, algorithm: this.state.algorithm});
        });
        this.showError = false;
    }
    
    componentDidUpdate() {
        if(this.props.nowPlaying && !this.state.playlistLoading && this.props.nowPlaying !== this.state.playlistUri) { 
            console.log(this.props.nowPlaying);
            this.setState({userInformation: this.state.userInformation, playlistLoading: true, 
                playlistReady: true, playlistUri: this.props.nowPlaying, algorithm: this.state.algorithm});
        }
        if(this.state.playlistLoading) {
            let svg = document.querySelector('.svg__spotify--stripes');
            !svg.classList.contains('svg__spotify--stripes--loading') && (
                svg.classList.add('svg__spotify--stripes--loading')
            ) ;
        }
    }

    initSearchIndex() {
        this.searchIndex = 0;
    }

    onSuccess(uri, lastIndex) {
        ++this.searchIndex;
        if(this.searchIndex >= lastIndex / 3 && this.searchIndex < lastIndex / 2) {
            console.log('33% Completed');
        } else if(this.searchIndex >= lastIndex / 2 && this.searchIndex !== lastIndex) {
            console.log('66% Completed');
        } else if(this.searchIndex === lastIndex ){
            console.log('100% Completed');
            this.props.updatePlaying(uri);
            let status = document.querySelector('.status-text');
            status && ( status.innerHTML = 'Complete!');
            this.showError = false;
            this.setState({
                userInformation: this.state.userInformation,
                playlistLoading: true,
                playlistReady: true,
                playlistUri: uri,
                algorithm: this.state.algorithm
            });
        }
    }

    onFailure() {
        let status = document.querySelector('.status-text');
        status && ( status.innerHTML = 'Could not find artist');
        this.showError = true;
        let stripes = document.querySelector('.svg__spotify--stripes');
        stripes.classList.remove('svg__spotify--stripes--loading');
        stripes.classList.add('svg__spotify--stripes--error');
        setTimeout(() => {
            stripes.classList.remove('svg__spotify--stripes--error');
        }, 1200);
        this.setState({
            userInformation: this.state.userInformation,
            playlistLoading: false,
            playlistReady: false,
            playlistUri: this.state.playlistLoading,
            algorithm: this.state.algorithm
        });
    }

    requestPlaylist(e) {
        e.preventDefault();

        this.setState({
            userInformation: this.state.userInformation,
            playlistLoading: true,
            playlistReady: false,
            playlistUri: this.state.uri,
            algorithm: this.state.algorithm
        });
        //document.querySelector('.svg__spotify--stripes').classList.add('svg__spotify--stripes--loading');
        // Get the input value
        let input = document.querySelector('input[type=text]').value;
        let artists = input.split(',');
        artists.forEach((_, i) => {
            artists[i] = artists[i].trim();
            artists[i] = artists[i][0].toUpperCase() + artists[i].substr(1);
        });

        // Create the playlist
        api.createPlaylist(this.state.userInformation.id, artists)
        .then((res, err) => {
            if(err) console.log(err);
            else {
                // Fill the playlist
                this.initSearchIndex();
                console.log('Searching for ', artists);
                console.log('Playlist ID should be sent as: ', res.uri);
                //trim foreach
                switch(this.state.algorithm) {
                    case 'sibling':
                    artists.forEach((artist, index) => api.siblingAlgorithm(
                        artist, 
                        this.props.user.id, 
                        res.uri, 
                        () => this.onSuccess(res.uri, artists.length),
                        () => this.onFailure()
                    ));
                    break;

                    case 'cousin':
                    artists.forEach((artist, index) => api.cousinAlgorithm(
                        artist, 
                        this.props.user.id, 
                        res.uri, 
                        () => this.onSuccess(res.uri, artists.length),
                        () => this.onFailure()

                    ));
                    break;

                    default:
                    break;
                }
            }
        });
        
        //Reset input
        document.querySelector('input[type=text]').value = '';
        document.querySelector('input[type=submit]').classList.add('inactive');        
    }

    handleChange() {
        const input = document.querySelector('input[type=text]').value;
        const button = document.querySelector('input[type=submit]');
        if(input.length > 0 ) {
            button.classList.remove('inactive');
        } else {
            button.classList.add('inactive');
        }
    }

    renderPlayList() {
        return <SplashScreen 
        token={this.props.token}
        playlistId={this.props.nowPlaying} 
        userId={this.props.user.id} />
    }

    changeAlgorithm(e) {
        e.preventDefault();

        const target = e.currentTarget;
        document.querySelectorAll('.algorithm-choice')
        .forEach(choice => {
            choice.classList.remove('algorithm-current');
        });
        target.classList.add('algorithm-current');
        this.setState({
            userInformation: this.state.userInformation,
            playlistLoading: this.state.playlistLoading,
            playlistReady: this.state.playlistReady,
            playlistUri: this.state.playlistUri,
            algorithm: target.id
        });
    }

    render() {
        return (
            <div className="playlist__section">
                <div className="input-field">
                    <form className="input-field__form" onSubmit={this.requestPlaylist.bind(this)}>
                        <input className="input-field__form__input" type="text" placeholder="Artist1, Artist2, Artist3 etc..." onChange={this.handleChange.bind(this)}/>
                        <div className="algorithm-choices">
                            <div className="algorithm-choice algorithm-current" id="cousin" onClick={this.changeAlgorithm.bind(this)}>
                                <h3>Mixed Algorithm</h3>
                                <p>Creates a playlist with zero reoccuring artists.</p>
                            </div>
                            <div className="algorithm-choice" id="sibling" onClick={this.changeAlgorithm.bind(this)}>
                                <h3>Common Algorithm</h3>
                                <p>Creates a more reliable playlist with reoccuring artists.</p>
                            </div>
                        </div>
                        <input className="input-field__form__submit inactive" type="submit" value="Create Playlist"/>
                    </form>
                {this.state.playlistReady && this.renderPlayList()}
                </div>
                    <div className="svg__area">
                        {svg}
                        {/* {( this.state.playlistLoading || this.showError ) && (
                            <p className="status-text">Creating playlist...</p>
                        )} */}
                    </div>
                <footer>Created by Sascha Ringström | <a href="mailto:sascharingstrom@gmail.com">sascharingstrom@gmail.com</a> </footer>
            </div>
        );
    }
}
