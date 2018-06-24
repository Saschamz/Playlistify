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

api.createPlaylist = (user_id, name) => {
    name = 'Playlistify: ' + name;
    return this.spotify.createPlaylist(user_id, {name, description: this.descriptionString});
};

api.getPlaylists = () => {
    return this.spotify.getUserPlaylists();
}

// Sibling Algorithm
// Artist > Related Artists > Top Tracks(5)
api.entireFlow = (artist, user_id, playlist_id) => {
    this.spotify.search(artist, ['artist'])
    .then((res, err) => {
        if(err) console.error(err);
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
    })
}

// Cousin Algorithm
// Artist > Related Artists > Related Artists > Top Tracks(1)
api.cousinAlgorithm = (artist, user_id, playlist_id) => {
    playlist_id = playlist_id.split(':');
    playlist_id = playlist_id[playlist_id.length - 1];
    this.spotify.search(artist, ['artist'])
    .then((res, err) => {
        if(err) console.error(err);
        this.spotify.getArtistRelatedArtists(res.artists.items[0].id)
        .then((res, err) => {
            if(err) console.error(err);
            const related = res.artists;

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
                        this.spotify.getArtistTopTracks(relatedRelatedArtist, 'SE')
                        .then((res, err) => {
                            if(err) --playlistLength;
                            else {
                                //console.log('alpha: ', relatedRelatedArtist);
                                //let track = res.tracks[0].uri;
                                let track = cousinFilter(res.tracks, res.tracks[0].artists[0].name);
                                //console.log('beta: ', track);
                                if(allTracks.includes(track)) {
                                    --playlistLength;
                                } else {
                                    allTracks.push(track);
                                }
                            }
                        })
                        .catch(_ => --playlistLength);
                    });
                }});
                
            });
        })
    })  
}
// Weekly algopithm
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