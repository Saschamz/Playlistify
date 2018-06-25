import React, { Component } from 'react';

export default class Statistics extends Component {

    componentWillMount() {
        const uniqueArtists = [];
        this.songs = this.props.playlist.items.length;
        this.artist = 0, this.duration = 0;
        this.props.playlist.tracks.items.forEach(item => {
            this.duration += item.track.duration_ms;
            let artistName = item.track.artists[0].name;
            !uniqueArtists.includes(artistName) && ++this.artist && uniqueArtists.push(artistName);
        });
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
                <div className="statistics__stat">{this.artists}</div>
                <div className="statistics__stat">{this.songs}</div>
                <div className="statistics__stat">{/*this.undecided*/}</div>
                <div className="statistics__stat">{this.duration}</div>
            </div>
        );
    }
}
