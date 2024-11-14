const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

// Function to validate averages
// Endpoint to get recommendations
console.log('path rec LOADED ')
router.post('/api/pathrecommendations', async (req, res) => {
  const {currentNodeFeatures: songFeatures, seedTrack: seedTrack} = req.body;
  console.log('Song features:', songFeatures);
  console.log('Seed Track:', seedTrack);

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

  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const url = `https://api.spotify.com/v1/recommendations?limit=30&seed_tracks=${seedTrack}&target_danceability=${songFeatures.danceability}&target_energy=${songFeatures.energy}&target_key=${songFeatures.key}&target_loudness=${songFeatures.loudness}&target_mode=${songFeatures.mode}&target_speechiness=${songFeatures.speechiness}&target_acousticness=${songFeatures.acousticness}&target_instrumentalness=${songFeatures.instrumentalness}&target_liveness=${songFeatures.liveness}&target_valence=${songFeatures.valence}&target_tempo=${songFeatures.tempo}`;

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
    
    res.json({
      tracks: data.tracks
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Failed to create playlist and add tracks: ${error.message}`);
  }
});

module.exports = router;

