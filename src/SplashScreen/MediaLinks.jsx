import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import ClipboardJS from 'clipboard';

export default class MediaLinks extends Component {

    componentDidMount() {
        new ClipboardJS('.clipboard');
    }

    facebook() {

        return (
            <div className="media-link"
            onClick={() => {
                alert('[NYI] The other actions work.');
            }}>
                <FontAwesome
                name='facebook'
                style={{color: '#3b5998'}}/>
            </div>
        );
    }

    twitter() {

        return (
            <div className="media-link"
            onClick={() => {
                window.open(`http://twitter.com/share?text=Check out this sick playlist I created using Playlistify!&url=${this.props.clipboard}&hashtags=playlistify`, '_blank');
            }}>
                <FontAwesome
                name='twitter'
                style={{color: 'hsl(207,88%,59%)'}}/>
            </div>
        );
    }

    clipboard() {

        return (
            <div className="media-link clipboard" data-clipboard-text={this.props.clipboard}>
                <FontAwesome
                name='clipboard'
                style={{color: '#888'}}/>
            </div>
        );
    }

    spotify() {

        return (
            <div className="media-link"
            onClick={() => window.open(this.props.spotifyLink, '_self')}>
                <FontAwesome 
                name='spotify'
                style={{color: 'var(--spotify-green)'}}/>
            </div>
        );
    }
    
    render() {
        return (
            <div className="media__links">
                {this.facebook()}
                {this.twitter()}
                {this.spotify()}
                {this.clipboard()}
            </div>
        );
    }
}