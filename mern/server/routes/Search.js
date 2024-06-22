const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

console.log("spotify_recommendations.js loaded");

// Endpoint to search for tracks
router.get('/api/search-tracks', async (req, res) => {
  const { query } = req.query;
  const userId = req.cookies.userID;
  const db_connect = dbo.getDb();
  var accessToken;
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
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Failed to fetch user data');
    }

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
