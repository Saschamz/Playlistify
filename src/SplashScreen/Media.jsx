import React, { Component } from 'react';

export default class Media extends Component {
    render() {
        return (
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
        );
    }
}