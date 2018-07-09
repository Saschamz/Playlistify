## API
- Add progress/volume slider to the player.
- Make a new playback request every time a song finishes playing.
Could do this together with progress slider or seperately by starting a variable interval function that
checks current play time at the playback request and is then managed by play/pause/skip logic.
If it acknowledges that the same song has finished playing it makes new playback request.
If it acknowledges that user has skipped song it does not need to make one and should cancel the interval. 

## Algorithm
- Weekly algorithm needs recursive error management (429: API rate limit exceeded).
- New algorithm that checks average danceability/BPM for top10 tracks of artists that are being searched for.
All songs added to playlist should then be within a set range of this.

## General
- A lot of code cleanup/small improvements.
- Making components more responsive as well as improving scaleability.
- Add refresh token functionality for spotify AUTH.
- Some users can't seem to press play button because "playlist.uri was not found in Player.jsx".

## Design
- Get the slide animation that is currently hidden working for track name when switching song.
- Improve mobile view, add sideplaylist as a hamburger menu.