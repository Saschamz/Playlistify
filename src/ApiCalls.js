import { searchAlgorithm, halfTopTracks, cousinFilter } from './SearchAlgorithm';
//const Spotify = require('spotify-web-api-js');
const SpotifyWebApi = require('spotify-web-api-js');
//const s = new Spotify();

const limit = 5; // This affects how many related artists are retrieved per search
// One artist results in 5*10 = 50 songs per playlist

export const api = {};

api.init = token => {
    this.spotify = new SpotifyWebApi();
    this.spotify.setAccessToken(token);
    
    // Strings
    this.descriptionString = 'This playlist was created using Playlistify.';
};

api.addToPlaylist = (artist) => {
    this.spotify.search(`${artist}`, ['artist'], (err, res) => {
        err && console.error(err);
        
        this.spotify.getArtistRelatedArtists(res.artists.items[0].id, (err, res) => {
            err && console.error(err);
            
            const relatedArtists = searchAlgorithm(res.artists, limit);
            // Call the algorithm and recieve an array of <=20 artists
            
            const returnData = [];
            
            relatedArtists.forEach((artist, index) => {
                
                this.spotify.getArtistTopTracks(relatedArtists[index].id, 'SE', (err, res) => {
                    if(err) console.log(err);
                    else returnData.push(res);
                });
                
            });
            
            let _interval = setInterval(() => {
                if(relatedArtists.length === returnData.length) {
                    console.log('returning ', returnData);
                    clearInterval(_interval);
                    return returnData;
                }
            }, 10);
            
        })
        
        
    })
}

api.getRelated = artist => {
    //return this.spotify
}

api.search = (artist) => {
    return this.spotify.search(artist);
}

api.userInformation = () => {
    return this.spotify.getMe();
};

api.capital_letter = (str) => {
    str = str.split(" ");

    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }

    return str.join(" ");
}

api.createPlaylist = (user_id, name) => {
    name = 'Playlistify: ' + api.capital_letter(name);
    return this.spotify.createPlaylist(user_id, {name, description: this.descriptionString});
};

api.getPlaylists = () => {
    return this.spotify.getUserPlaylists();
}


/*
* WIP WIP WIP
* Below are endpoints for the player
* WIP WIP WIP
*/

api.getPlayBack = () => {
    return this.spotify.getMyCurrentPlayBackState();
}

// Send a context_uri if playlist is not playing
api.play = (context_uri = false) => {
    context_uri ? this.spotify.play({context_uri}) : this.spotify.play();
}

api.pause = () => {
    return this.spotify.pause();
}

api.next = () => {
    return this.spotify.skipToNext();
}

api.previous = () => {
    return this.spotify.skipToPrevious();
}

// volume_percent: 0-100
api.volume = (volume_percent) => {
    return this.spotify.setVolume(+volume_percent);
}

// state: boolean
api.shuffle = (state) => {
    return this.spotify.setShuffle(state);
}


// Sibling Algorithm
// Artist > Related Artists > Top Tracks(5)
api.siblingAlgorithm = (artist, user_id, playlist_id, callback, failure) => {
    this.spotify.search(artist, ['artist'])
    .then((res, err) => {
        if(err) console.error(err);
        if(!res.artists.items[0]) {
            failure();
        } else {
        this.spotify.getArtistRelatedArtists(res.artists.items[0].id)
        .then((res, err) => {
            if(err) console.error(err);
            const related = res.artists;


            let allTracks = [];
            const update = setInterval(() => {
                if(allTracks.length  === related.length) {
                    allTracks = allTracks.map((trackList, index) => halfTopTracks(trackList, related[index].name));
                    allTracks = [].concat.apply([], allTracks);
                    allTracks.forEach((_, index) => {
                        if(index !== 0 && index % 100 === 0) {
                            let payload = allTracks.slice(0, index);
                            this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                            .then((res, err) => {
                                if(err) console.error(err);
                            })
                        } else if(index + 1 === allTracks.length) {
                            let payload = allTracks.slice(Math.floor(index / 100) * 100, index + 1);
                            this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                            .then((res, err) => {
                                if(err) console.error(err);
                                else if(index + 1 === allTracks.length) callback();
                            })
                        }
                    });
                    clearInterval(update);
                }
            }, 10);

            related.forEach(artist => {
                this.spotify.getArtistTopTracks(artist.id, 'SE')
                .then((res, err) => {
                    if(err) console.error(err);
                    // add to playlist
                    const tracks = []; 
                    allTracks.push(tracks);
                    playlist_id = playlist_id.split(':');
                    playlist_id = playlist_id[playlist_id.length - 1];
                    res.tracks.forEach(track => tracks.push(track.uri));
                })
            })
        
        })
    }
    })
    
}

// Cousin Algorithm
// Artist > Related Artists > Related Artists > Top Tracks(1)
api.cousinAlgorithm = (artist, user_id, playlist_id, callback, failure) => {
    playlist_id = playlist_id.split(':');
    playlist_id = playlist_id[playlist_id.length - 1];
    this.spotify.search(artist, ['artist'])
    .then((res, err) => {
        if(err) console.error(err);
        if(!res.artists.items[0]) failure();
        else {
        this.spotify.getArtistRelatedArtists(res.artists.items[0].id)
        .then((res, err) => {
            if(err) console.error(err);
            const related = res.artists;
            console.log('Found related: ', related.length);

            let allTracks = [];
            let playlistLength = related.length * 20;

            const update = setInterval(() => {
                console.log(allTracks.length, playlistLength);
                if(allTracks.length === playlistLength) {
                    console.log(allTracks);
                    clearInterval(update);

                    allTracks.forEach((_, index) => {
                        if(index !== 0 && index % 100 === 0) {
                            let payload = allTracks.slice(index - 100, index);
                            this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                            .then((res, err) => {
                                if(err) console.error(err);
                            })
                        } else if(index + 1 === allTracks.length) {
                            let payload = allTracks.slice(Math.floor(index / 100) * 100, index + 1);
                            this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                            .then((res, err) => {
                                if(err) console.error(err);
                                else if(index + 1 === allTracks.length) callback();
                            })
                            .catch(e => {
                                console.log('Error creating playlist');
                                
                                    setTimeout(() => {
                                        allTracks.forEach((_, index) => {
                                            if(index !== 0 && index % 100 === 0) {
                                                let payload = allTracks.slice(index - 100, index);
                                                this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                                                .then((res, err) => {
                                                    if(err) console.error(err);
                                                })
                                            } else if(index + 1 === allTracks.length) {
                                                let payload = allTracks.slice(Math.floor(index / 100) * 100, index + 1);
                                                this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                                                .then((res, err) => {
                                                    if(err) console.error(err);
                                                })
                                            }})
                                    }, 5000);
                                
                            })
                        }
                    });
                }
            }, 10);

            const finalArtists = [];

            related.forEach(relatedArtist => {
                this.spotify.getArtistRelatedArtists(relatedArtist.id)
                .then((res, err) => {
                    if(err) playlistLength -= 20;
                    else {

                    
                    let relatedRelated = res.artists;
                    console.log('Found related: ', relatedRelated.length);
                    if(relatedRelated.length != 20) playlistLength -= (20 - relatedRelated.length);

                    // Experimental
                    let _payload = [];
                    relatedRelated.forEach(_artist => {
                        if(finalArtists.includes(_artist.id) || _artist.name === artist ) {
                            --playlistLength;
                        } else {
                            finalArtists.push(_artist.id) && _payload.push(_artist.id);
                        }
                    });
                    
                    _payload.forEach(relatedRelatedArtist => {

                        // Try this shit
                        let chill = (relatedRelatedArtist) => {
                        this.spotify.getArtistTopTracks(relatedRelatedArtist, 'SE')
                        .then((res, err) => {
                            if(err) {
                                console.log('Triggered err, ', err);
                                setTimeout(() => chill(relatedRelatedArtist), 5000);
                                console.log('Retrying in 5...')
                            }
                            else {
                                //console.log('alpha: ', relatedRelatedArtist);
                                //let track = res.tracks[0].uri;
                                
                                let track = cousinFilter(res.tracks, res.tracks[0].artists[0].name);
                                !track && ( track = res.tracks[0].uri );
                                console.log('Track inside apicalls is: ', track);
                                //console.log('beta: ', track);
                                if(allTracks.includes(track)) {
                                    --playlistLength;
                                } else {
                                    allTracks.push(track);
                                }
                            }
                        })
                        .catch(e => {
                            if(e) {
                                console.log(e);
                                //console.log('Catch found, ', e);
                                if(e.status === 429) setTimeout(() => chill(relatedRelatedArtist), 5000);
                                else --playlistLength;
                                //console.log('Retrying in 5...')
                            }
                        });
                        }
                        chill(relatedRelatedArtist);

                    });
                
                }});
                
            });
        })
    }
    })  
}

// Weekly algorithm
// User top artists > Related > Top tracks(1)
api.weeklyAlgorithm = (user_id, playlist_id) => {
    playlist_id = playlist_id.split(':');
    playlist_id = playlist_id[playlist_id.length - 1];
    this.spotify.getMyTopArtists()
    .then((res, err) => {
        if(err) console.error(err);
        console.log(res);
        let artists = res.items;
        const ogArtists = [];
        artists.forEach(artist => ogArtists.push(artist.id));
        
        let allTracks = [];
        let playlistLength = 400;

        const update = setInterval(() => {
            console.log(allTracks.length, playlistLength);
            if(allTracks.length === playlistLength) {
                console.log(allTracks);
                clearInterval(update);

                allTracks.forEach((_, index) => {
                    if(index !== 0 && index % 100 === 0) {
                        let payload = allTracks.slice(index - 100, index);
                        this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                        .then((res, err) => {
                            if(err) console.error(err);
                        })
                    } else if(index + 1 === allTracks.length) {
                        let payload = allTracks.slice(Math.floor(index / 100) * 100, index + 1);
                        this.spotify.addTracksToPlaylist(user_id, playlist_id, payload)
                        .then((res, err) => {
                            if(err) console.error(err);
                        })
                    }
                });
            }
        }, 10);

        const finalArtists = [];

        artists.forEach(topArtist => {
            this.spotify.getArtistRelatedArtists(topArtist.id)
            .then((res, err) => {
                if(err) console.error(err);
                let related = res.artists;

                let _payload = [];
                related.forEach(_artist => {
                    if(finalArtists.includes(_artist.id) || ogArtists.includes(_artist.id)) {
                        --playlistLength;
                    } else {
                        finalArtists.push(_artist.id) && _payload.push(_artist.id);
                    }
                });

                _payload.forEach(artist => {
                    this.spotify.getArtistTopTracks(artist, 'SE')
                    .then((res, err) => {
                        if(err) --playlistLength;
                        let track = res.tracks[0].uri;
                        if(allTracks.includes(track)) {
                            --playlistLength;
                        } else {
                            allTracks.push(track);
                        }
                    });
                });

            });
        });
    });
}