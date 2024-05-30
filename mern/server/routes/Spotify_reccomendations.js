const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

console.log("spotify_recommendations.js loaded");

// Endpoint to get recommendations
router.post('/api/recommendations', async (req, res) => {
  console.log('Received request for recommendations');
  const { adjustedAverages } = req.body;
  console.log('Adjusted Averages:', adjustedAverages);

  const accessToken = req.session.access_token;
  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/recommendations?limit=30&target_danceability=${adjustedAverages.danceability}&target_energy=${adjustedAverages.energy}&target_key=${adjustedAverages.key}&target_loudness=${adjustedAverages.loudness}&target_mode=${adjustedAverages.mode}&target_speechiness=${adjustedAverages.speechiness}&target_acousticness=${adjustedAverages.acousticness}&target_instrumentalness=${adjustedAverages.instrumentalness}&target_liveness=${adjustedAverages.liveness}&target_valence=${adjustedAverages.valence}&target_tempo=${adjustedAverages.tempo}`, {
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
    console.log('Fetched recommendations:', data);
    res.json(data.tracks);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send(`Failed to fetch recommendations: ${error.message}`);
  }
});

module.exports = router;
