import React, { Component } from 'react';

export default class Media extends Component {

    shareFacebook() {
        
    }

    render() {
        return (
            <div className="playlist__footer">
                <div className="media">
                    <div className="media__option media__option--facebook">
                        Share on Facebook
                    </div>
                    <div className="media__option media__option--twitter">
                        Share on Twitter
                    </div>
                    <div className="media__option media__option--clipboard">
                        Copy link to clipboard
                    </div>
                </div>
                <div className="open-in-spotify" onClick={() => {
                    window.open(this.props.spotifyLink, '_self');
                }}>
                    <h3>Open in spotify</h3>
                </div>
            </div>
        );
    }
}