const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

console.log("spotify_recommendations.js loaded");

// Function to validate averages
// Endpoint to get recommendations
router.post('/api/recommendations', async (req, res) => {
  console.log('Received request for recommendations');
  const { adjustedAverages } = req.body;
  //console.log('Adjusted Averages:', adjustedAverages);


  const accessToken = req.session.access_token;
  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const url = `https://api.spotify.com/v1/recommendations?limit=30&seed_genres=hip-hop&target_danceability=${adjustedAverages.danceability}&target_energy=${adjustedAverages.energy}&target_key=${adjustedAverages.key}&target_loudness=${adjustedAverages.loudness}&target_mode=${adjustedAverages.mode}&target_speechiness=${adjustedAverages.speechiness}&target_acousticness=${adjustedAverages.acousticness}&target_instrumentalness=${adjustedAverages.instrumentalness}&target_liveness=${adjustedAverages.liveness}&target_valence=${adjustedAverages.valence}&target_tempo=${adjustedAverages.tempo}`;

    console.log('Request URL:', url);
    console.log('Access Token:', accessToken);
    console.log(url)

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
    //console.log('Fetched recommendations:', data);
    res.json(data.tracks);
    //console.log(data.tracks)
    // Create a new playlist for the user
    const userId = req.session.userID ;
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Discover Music 3 June',
        description: 'Playlist generated based on your quiz responses',
        public: false
      })
    });

    if (!createPlaylistResponse.ok) {
      const errorText = await createPlaylistResponse.text();
      console.error('Error creating playlist:', errorText);
      throw new Error(`Failed to create playlist: ${errorText}`);
    }
    recommendedTracks = data.tracks.map(track => track.uri);

    const playlistData = await createPlaylistResponse.json();
    const playlistId = playlistData.id;
    req.session.playlist_id = playlistId;
    console.log('Created Playlist ID:', playlistId);

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

    console.log('Tracks added to playlist');

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Failed to create playlist and add tracks: ${error.message}`);
  }
});

module.exports = router;
