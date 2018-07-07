import React, { Component } from 'react';
import MediaLinks from './MediaLinks';

export default class Statistics extends Component {

    constructor(props) {
        super(props);
        this.state = {update: false};
    }

    componentWillMount() {
        this.updateComponent();
    }

    updateComponent() {
        const uniqueArtists = [];
        this.songs = this.props.playlist.tracks.total;
        this.artist = 0, this.duration = 0, this.popularityPerSong = 0;
        this.currentPlaylistId = this.props.playlist.id;

        this.props.playlist.tracks.items.forEach(item => {
            this.popularityPerSong += item.track.popularity;
            this.duration += item.track.duration_ms;
            let artistName = item.track.artists[0].name;
            !uniqueArtists.includes(artistName) && ++this.artist && uniqueArtists.push(artistName);
        });

        this.popularityPerSong /= this.songs;
        this.popularityPerSong = Math.round(( this.popularityPerSong * 10 ) / 10);
        const m_duration = this.duration / 1000 / 60;
        const h_duration = this.duration / 1000 / 60 / 60;

        if(h_duration >= 1) {
            this.duration = Math.round(h_duration) + 'h';
        } else {
            this.duration = Math.round(m_duration) + 'm';
        }
        this.setState({update: !this.state.update});
    }

    componentDidUpdate() {
        if(this.currentPlaylistId !== this.props.playlist.id) this.updateComponent();
    }

    render() {
        return (
            <div>
                <h1 className="playlist__name">{this.props.playlist.name}</h1>
                <MediaLinks spotifyLink={this.props.spotifyLink} clipboard={this.props.clipboard}/>
                <div className="statistics">
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.artist}</h3>
                        <span className="statistics__stat__tooltip">artists</span>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.songs}</h3>
                        <span className="statistics__stat__tooltip">songs</span>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.popularityPerSong}</h3>
                        <span className="statistics__stat__tooltip">popularity</span>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.duration}</h3>
                        <span className="statistics__stat__tooltip">duration</span>
                    </div>
                </div>
            </div>
        );
    }
}