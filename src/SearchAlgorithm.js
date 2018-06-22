export function searchAlgorithm(data, limit) {

    // Retrieve history or create if non existant
    let history = JSON.parse(localStorage.getItem('history')) || localStorage.setItem('history', JSON.stringify([]));

    // Perform input validation
    !Array.isArray(history) && ( history = [] );
    limit > data.length && ( limit = data.length );
    if(!Array.isArray(data) || typeof limit !== 'number') {
        console.error('Datatypes not valid');
        return;
    } else if(!data[0]) {
        console.error('Data was empty');
        return;
    }
    
    // Arrays to group for filtering
    const neverHeardBefore = [];
    const heardBefore = [];
    const results = [];
    
    // Fill the arrays above to be filtered again if necessary
    data.forEach(artist => {
        history.indexOf(artist.name) < 0 ? neverHeardBefore.push(artist) : heardBefore.push(artist);
    });
    
    if(neverHeardBefore.length >= limit) {
        for(let x = 0; x < limit; x++) results.push(neverHeardBefore[x]);
        results.forEach(result => history.push(result.name));
    } else {
        for(let x = 0; x < neverHeardBefore.length; x++) results.push(neverHeardBefore[x]);
        results.forEach(result => history.push(result.name));
        for(let x = 0; x < limit - neverHeardBefore.length; x++) results.push(heardBefore[x]);
    }

    // Add new artists to history and return the results
    localStorage.setItem('history', JSON.stringify(history));
    console.log('History is now ', history);
    return results;
}

export function halfTopTracks(tracks, artist) {

    // Retrieve history or create if non existant
    let history = JSON.parse(localStorage.getItem('history')) || localStorage.setItem('history', JSON.stringify([]));

    // Perform input validation
    !Array.isArray(history) && ( history = [] );

    // Check if artist exists in history
    let isInHistory = false;
    let existingArtist;
    history.forEach((historyArtist, index) => {
        if(historyArtist.name === artist) {
            isInHistory = true;
            existingArtist = historyArtist;
            history[index].top = !history[index].top;
        }
    });

    // Decide which half of the top10 tracks to return
    if(isInHistory) {
        !existingArtist.top ? tracks = tracks.slice(0, tracks.length / 2) : tracks = tracks.slice(tracks.length / 2, tracks.length);
    } else {
        tracks = tracks.slice(0, tracks.length / 2);
        const artistHistory = {
            name: artist,
            top: false
        }
        history.push(artistHistory);
    }

    // Add new artists to history, update current artists state and return the results
    localStorage.setItem('history', JSON.stringify(history));

    return tracks;
}
