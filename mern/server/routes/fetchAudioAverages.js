const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

router.get(`/api/audio-features`, async (req, res) => {
  const { trackId } = req.query;
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
  } catch (error) {
    return res.status(500).send('Failed to fetch user data');
  }

  if (!accessToken) {
    return res.status(401).send('Access token is missing or expired');
  }

  let response;
  try {
    response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackId},`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch audio features: ${errorText}`);
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }

  const data = await response.json();
  console.log("data: ", data);
  const audioFeatures = await data.audio_features; // Array of audio features objects
  if (!Array.isArray(audioFeatures)) {
    return res.status(404).send('Audio features is not an array');
  }

  const totals = {
    danceability: 0,
    energy: 0,
    key: 0,
    loudness: 0,
    mode: 0,
    speechiness: 0,
    acousticness: 0,
    instrumentalness: 0,
    liveness: 0,
    valence: 0,
    tempo: 0
  };

  audioFeatures.forEach(feature => {
    if (feature) { // Check if feature is not null
      console.log("feature: ", feature);
      totals.danceability += feature.danceability;
      totals.energy += feature.energy;
      totals.key += feature.key;
      totals.loudness += feature.loudness;
      totals.mode += feature.mode;
      totals.speechiness += feature.speechiness;
      totals.acousticness += feature.acousticness;
      totals.instrumentalness += feature.instrumentalness;
      totals.liveness += feature.liveness;
      totals.valence += feature.valence;
      totals.tempo += feature.tempo;
    }
  });
  res.send(totals);
});

module.exports = router;
