const fetch = require('node-fetch');
const dbo = require("../db/conn");
const express = require('express');
const request = require('request');
const router = express.Router();
require('dotenv').config();

const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const redirect_uri = 'https://discover-music.onrender.com/spotify/callback'; // Ensure this matches your backend port

console.log("Spotify_login.js loaded");

const fetchAudioFeatures = async (accessToken, trackIds) => {
  const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch audio features: ${errorText}`);
  }

  const data = await response.json();
  return data.audio_features; // Ensure this is an array
};

const calculateAverages = (audioFeatures) => {
  if (!Array.isArray(audioFeatures)) {
    throw new Error('Audio features is not an array');
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
  });

  const averages = {};
  for (const key in totals) {
    averages[key] = totals[key] / audioFeatures.length;
  }

  return averages;
};

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    console.log("No authorization code found");
    return res.status(400).send("Authorization code missing");
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, async (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error('Error fetching access token:', error || body);
      return res.status(500).send('Failed to authenticate with Spotify');
    }

    const access_token = body.access_token;
    const db_connect = dbo.getDb();

    req.session.access_token = access_token;
    
    try {
      const userProfileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': 'Bearer ' + access_token }
      });

      const userProfileText = await userProfileResponse.text();

      if (!userProfileResponse.ok) {
        return res.status(500).send(`Failed to fetch user profile: ${userProfileText}`);
      }

      let userProfile;
      try {
        userProfile = JSON.parse(userProfileText);
      } catch (jsonError) {
        return res.status(500).send('Failed to parse user profile data');
      }

      req.session.userID = userProfile.id;


      const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        headers: { 'Authorization': 'Bearer ' + access_token }
      });

      const recentlyPlayedText = await recentlyPlayedResponse.text();

      if (!recentlyPlayedResponse.ok) {
        return res.status(500).send(`Failed to fetch recently played tracks: ${recentlyPlayedText}`);
      }

      let recentlyPlayed;
      try {
        recentlyPlayed = JSON.parse(recentlyPlayedText);
      } catch (jsonError) {
        return res.status(500).send('Failed to parse recently played tracks data');
      }

      const trackIds = recentlyPlayed.items.map(item => item.track.id);
      const audioFeatures = await fetchAudioFeatures(access_token, trackIds);

      const averages = calculateAverages(audioFeatures);

      const usersCollection = db_connect.collection('users');
      const existingUser = await usersCollection.findOne({ id: userProfile.id });

      let playlists = [];
      if (existingUser) {
        playlists = existingUser.playlists || [];
      }

      const userDoc = {
        ...userProfile,
        recentlyPlayed: recentlyPlayed.items,
        audioFeaturesAverages: averages,
        playlists: playlists // Use existing playlists if they exist
      };

      req.session.user = userDoc;

      if (existingUser) {
        await usersCollection.updateOne({ id: userProfile.id }, { $set: userDoc });
        console.log('User Profile Updated:', userDoc);
      } else {
        await usersCollection.insertOne(userDoc);
        console.log('User Profile Inserted:', userDoc);
      }

      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).send(`Failed to save data to database: ${dbError.message}`);
    }
  });
});
  
module.exports = router;