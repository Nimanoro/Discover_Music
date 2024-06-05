const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();

console.log("spotify_recommendations.js loaded");

// Endpoint to search for tracks
router.get('/api/search-tracks', async (req, res) => {
  const { query } = req.query;
  const accessToken = req.session.access_token;

  if (!accessToken) {
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search tracks: ${errorText}`);
    }

    const data = await response.json();
    res.json(data.tracks.items);
  } catch (error) {
    res.status(500).send(`Failed to search tracks: ${error.message}`);
  }
});

module.exports = router;
