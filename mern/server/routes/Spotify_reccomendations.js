const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

console.log("spotify_recommendations.js loaded");

// Function to validate averages
// Endpoint to get recommendations
const userId = req.cookies.userID;
  const db_connect = dbo.getDb();
  let accessToken;
  const usersCollection = db_connect.collection('users');
  if (!userId) {
      return res.status(401).send('User not logged in');
    }
  
    try {
      const user = await usersCollection.findOne({ id: userId });
      if (!user) {
        return res.status(404).send('User not found');
      }
      accessToken = user.access_token;
      console.log("user was accessed for search!", user)
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).send('Failed to fetch user data');
    }

  if (!accessToken) {
    return res.status(401).send('Access token is missing or expired');
  }

router.post('/api/recommendations', async (req, res) => {
  const { adjustedAverages, seedTrack, user_mood } = req.body;
  console.log('Adjusted Averages:', adjustedAverages);
  console.log('Seed Track:', seedTrack);
  console.log('User Mood:', user_mood);

  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const url = `https://api.spotify.com/v1/recommendations?limit=30&seed_tracks=${seedTrack}&target_danceability=${adjustedAverages.danceability}&target_energy=${adjustedAverages.energy}&target_key=${adjustedAverages.key}&target_loudness=${adjustedAverages.loudness}&target_mode=${adjustedAverages.mode}&target_speechiness=${adjustedAverages.speechiness}&target_acousticness=${adjustedAverages.acousticness}&target_instrumentalness=${adjustedAverages.instrumentalness}&target_liveness=${adjustedAverages.liveness}&target_valence=${adjustedAverages.valence}&target_tempo=${adjustedAverages.tempo}`;

    console.log('Request URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching recommendations:', errorText);
      throw new Error(`Failed to fetch recommendations: ${errorText}`);
    }

    const data = await response.json();
    var recommendedTracks = data.tracks.map(track => track.uri);
    
    
    // Fetch the seed track to get the image
    let img = null;
    try {
      const seedTrackResponse = await fetch(`https://api.spotify.com/v1/tracks/${seedTrack}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!seedTrackResponse.ok) {
        const errorText = await seedTrackResponse.text();
        throw new Error(`Failed to fetch seed track: ${errorText}`);
      }

      const seedTrackData = await seedTrackResponse.json();
      //console.log("Seed Track Data:", seedTrackData);
      img = seedTrackData.album.images[0]?.url;
      recommendedTracks = [seedTrackData.uri, ...recommendedTracks]
      user_mood.song = [seedTrackData.name, seedTrackData.artists[0].name];
    } catch (error) {
      console.error(`Failed to fetch seed track: ${error.message}`);
    }
    console.log(user_mood);

    const userId = req.session.userID;
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `Discover Music ${new Date().getDay()}/${new Date().getMonth()}`,
        description: `generated by discover music app on ${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()}`, 
        public: false
      })
    });

    if (!createPlaylistResponse.ok) {
      const errorText = await createPlaylistResponse.text();
      console.error('Error creating playlist:', errorText);
      throw new Error(`Failed to create playlist: ${errorText}`);
    }

    const playlistData = await createPlaylistResponse.json();
    const playlistId = playlistData.id;
    req.session.playlist_id = playlistId;
    //console.log('Created Playlist ID:', playlistId);

    // Add tracks to the newly created playlist
    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: recommendedTracks
      })
    });

    if (!addTracksResponse.ok) {
      const errorText = await addTracksResponse.text();
      console.error('Error adding tracks to playlist:', errorText);
      throw new Error(`Failed to add tracks to playlist: ${errorText}`);
    }

    //console.log('Tracks added to playlist');

    const db_connect = dbo.getDb();
    const usersCollection = db_connect.collection('users');
    await usersCollection.updateOne(
      { id: userId },
      { $push: { playlists: { id: playlistData.id, name: playlistData.name, image: img,  created_at: new Date()} } }
    );
    console.log('Playlist added to user profile');

    res.json({
      playlistId,
      playlistName: playlistData.name,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      playlistImage: img,
      tracks: data.tracks
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Failed to create playlist and add tracks: ${error.message}`);
  }
});

module.exports = router;

