import React, { Component } from 'react';

export default class Statistics extends Component {

    componentWillMount() {
        const uniqueArtists = [];
        this.songs = this.props.playlist.items.length;
        this.artist = 0, this.duration = 0, this.popularityPerSong;
        this.props.playlist.tracks.items.forEach(item => {
            this.popularityPerSong += item.popularity;
            this.duration += item.track.duration_ms;
            let artistName = item.track.artists[0].name;
            !uniqueArtists.includes(artistName) && ++this.artist && uniqueArtists.push(artistName);
        });
        this.popularityPerSong /= this.songs;
        const m_duration = this.duration / 1000 / 60;
        const h_duration = this.duration / 1000 / 60 / 60;
        if(h_duration >= 1) {
            this.duration = Math.round(h_duration) + 'h';
        } else {
            this.duration = Math.round(m_duration) + 'm';
        }
    }

    render() {
        return (
            <div className="statistics">
                <div className="statistics__stat">
                    <h3 className="statistics__stat__header">{this.artists}</h3>
                    <span className="statistics__stat__tooltip">artists</span>
                </div>
                <div className="statistics__stat">
                    <h3 className="statistics__stat__header">{this.songs}</h3>
                    <span className="statistics__stat__tooltip">songs</span>
                </div>
                <div className="statistics__stat">
                    <h3 className="statistics__stat__header">{this.popularityPerSong}</h3>
                    <span className="statistics__stat__tooltip">average popularity</span>
                </div>
                <div className="statistics__stat">
                    <h3 className="statistics__stat__header">{this.duration}</h3>
                    <span className="statistics__stat__tooltip">duration</span>
                </div>
            </div>
        );
    }
}
