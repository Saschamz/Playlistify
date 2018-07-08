import React, { Component } from 'react';
import MediaLinks from './MediaLinks';

export default class Statistics extends Component {

    constructor(props) {
        super(props);
        this.state = {update: false};
    }

    componentWillMount() {
        this.updateComponent();
        console.log('PROPS= ', this.props);
    }

    updateComponent() {

        const tracks = this.props.playlist.tracks.items;
        const releaseDates = new Set();
        const uniqueTracks = new Set();
        let oldestTrack = 2018;
        let latestTrack = 0;
        this.mostPopular = {trending: 0, artist: '', track: ''};
        this.leastPopular = {trending: 100, artist: '', track: ''};


        const uniqueArtists = [];
        this.songs = this.props.playlist.tracks.total;
        console.log('SONGS ', this.props.playlist.tracks);
        this.artist = 0, this.duration = 0, this.popularityPerSong = 0;
        this.currentPlaylistId = this.props.playlist.id;

        this.props.playlist.tracks.items.forEach(item => {
            let release = item.track.album.release_date.substr(0,4);
            let popularity = item.track.popularity;
            const trackName = item.track.name;
            let artistNames = [];
            item.track.artists.forEach(artist => artistNames.push(artist.name));

            if ( popularity > this.mostPopular.trending ) {
                this.mostPopular.trending = popularity;
                this.mostPopular.artist = artistNames.join(', ');
                this.mostPopular.track = trackName;
            } else if ( popularity < this.leastPopular.trending ) {
                this.leastPopular.trending = popularity;
                this.leastPopular.artist = artistNames.join(', ');
                this.leastPopular.track = trackName;
            }

            uniqueTracks.add(item.track.name);
            releaseDates.add(release);
            release < oldestTrack && ( oldestTrack = release );
            release > latestTrack && ( latestTrack = release );
            this.popularityPerSong += item.track.popularity;
            this.duration += item.track.duration_ms;


            artistNames.forEach(artistName => {
                !uniqueArtists.includes(artistName) && ++this.artist && uniqueArtists.push(artistName);
            });
        });

        // Get statistics for hover tooltip
        this.timeline = [], this.trackList = [];
        releaseDates.forEach(release => {
            this.timeline.push(+release);
        });
        uniqueTracks.forEach(track => {
            this.trackList.push(track);
        });
        this.timeline.sort();
        this.timespan = {
            start: oldestTrack,
            end: latestTrack
        };
        this.artistList = uniqueArtists.sort();
        this.trackList.sort();

        this.popularityPerSong /= this.songs;
        this.popularityPerSong = Math.round(( this.popularityPerSong * 10 ) / 10);
        const m_duration = this.duration / 1000 / 60;
        const h_duration = this.duration / 1000 / 60 / 60;
        this.averageTrackDuration = Math.round(m_duration /  this.songs * 10) / 10;

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
            <div className="stats__container">
                <h1 className="playlist__name">{this.props.playlist.name}</h1>
                <MediaLinks spotifyLink={this.props.spotifyLink} clipboard={this.props.clipboard}/>
                <div className="statistics">
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.artist}</h3>
                        <span className="statistics__stat__tooltip">artists</span>
                        <ul className="statistics__hidden-list">
                            {this.artistList.map((artist, key) => <li className="statistics__hidden-list__list-item" key={key}>{artist}</li>)}
                        </ul>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.songs}</h3>
                        <span className="statistics__stat__tooltip">songs</span>
                        <ul className="statistics__hidden-list">
                            {this.trackList.map((track, key) => <li className="statistics__hidden-list__list-item" key={key}>{track}</li>)}
                        </ul>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.popularityPerSong}%</h3>
                        <span className="statistics__stat__tooltip">trending</span>
                        <ul className="statistics__hidden-list">
                            <li className="statistics__hidden-list__list-item">Min: {this.leastPopular.trending}%  {this.leastPopular.artist} - {this.leastPopular.track}<br/>
                            Max: {this.mostPopular.trending}%  {this.mostPopular.artist} - {this.mostPopular.track}</li>
                        </ul>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.duration}</h3>
                        <span className="statistics__stat__tooltip">duration</span>
                        <ul className="statistics__hidden-list">
                            <li className="statistics__hidden-list__list-item">Average: {this.averageTrackDuration}m</li>
                        </ul>
                    </div>
                    <div className="statistics__stat">
                        <h3 className="statistics__stat__header">{this.timespan.start + '-' + this.timespan.end}</h3>
                        <span className="statistics__stat__tooltip">timespan</span>
                        <ul className="statistics__hidden-list">
                            {this.timeline.map((time, key) => <li className="statistics__hidden-list__list-item" key={key}>{time}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}