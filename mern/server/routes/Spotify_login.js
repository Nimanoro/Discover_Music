const fetch = require('node-fetch');
const dbo = require("../db/conn");
const express = require('express');
const request = require('request');
const router = express.Router();

const client_id = 'c45598b6ed004b3691abf893c3194eed';
const client_secret = '428f3d12a1af475d976a588517daabf5';
const redirect_uri = 'http://localhost:2800/spotify/callback'; // Ensure this matches your backend port

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
  //console.log('Audio Features Response:', data);
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

const saveAveragesToUser = async (userId, averages) => {
  const db_connect = dbo.getDb();
  const usersCollection = db_connect.collection('users');
  await usersCollection.updateOne(
    { id: userId },
    { $set: { audioFeaturesAverages: averages } }
  );
};

router.get('/callback', async (req, res) => {
  console.log("Callback received");
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

  console.log('Auth Options:', authOptions);

  request.post(authOptions, async (error, response, body) => {
    if (error || response.statusCode !== 200) {
      console.error('Error fetching access token:', error || body);
      return res.status(500).send('Failed to authenticate with Spotify');
    }

    //console.log('Received body:', body);

    const access_token = body.access_token;
    const refresh_token = body.refresh_token;
    const expires_in = body.expires_in;
    const db_connect = dbo.getDb();

    console.log('Access Token:', access_token);
    req.session.access_token = access_token;
    console.log('access_token:', req.session.access_token);

    //console.log('Refresh Token:', refresh_token);
    //console.log('Expires In:', expires_in);

    try {
      // Fetch user profile data
      const userProfileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': 'Bearer ' + access_token }
      });

      const userProfileText = await userProfileResponse.text();
      //console.log('User Profile Response:', userProfileText);

      if (!userProfileResponse.ok) {
        //console.error('Error fetching user profile:', userProfileText);
        return res.status(500).send(`Failed to fetch user profile: ${userProfileText}`);
      }

      let userProfile;
      try {
        userProfile = JSON.parse(userProfileText);
      } catch (jsonError) {
        //console.error('Error parsing JSON:', jsonError);
        return res.status(500).send('Failed to parse user profile data');
      }

      //console.log('User Profile:', userProfile);

      // Fetch recently played tracks
      const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: { 'Authorization': 'Bearer ' + access_token }
      });

      const recentlyPlayedText = await recentlyPlayedResponse.text();
      //console.log('Recently Played Response:', recentlyPlayedText);

      if (!recentlyPlayedResponse.ok) {
        //console.error('Error fetching recently played tracks:', recentlyPlayedText);
        return res.status(500).send(`Failed to fetch recently played tracks: ${recentlyPlayedText}`);
      }

      let recentlyPlayed;
      try {
        recentlyPlayed = JSON.parse(recentlyPlayedText);
      } catch (jsonError) {
        //console.error('Error parsing JSON:', jsonError);
        return res.status(500).send('Failed to parse recently played tracks data');
      }

      //console.log('Recently Played:', recentlyPlayed);

      // Save user profile and recently played tracks to MongoDB
      const usersCollection = db_connect.collection('users');
      const userDoc = {
        ...userProfile,
        recentlyPlayed: recentlyPlayed.items
      };
      const existingUser = await usersCollection.findOne({ id: userProfile.id });

      if (existingUser) {
        // Update existing user profile
        await usersCollection.updateOne({ id: userProfile.id }, { $set: userDoc });
        //console.log('User Profile Updated:', userDoc);
      } else {
        // Insert new user profile
        await usersCollection.insertOne(userDoc);
        //console.log('User Profile Inserted:', userDoc);
      }

      // Get audio features for recently played tracks
      const trackIds = recentlyPlayed.items.map(item => item.track.id);
      const audioFeatures = await fetchAudioFeatures(access_token, trackIds);
      //console.log('Audio Features:', audioFeatures);
      req.session.audioFeatures = audioFeatures;

      // Calculate averages
      const averages = calculateAverages(audioFeatures);
      //console.log('Averages:', averages);

      // Save averages to database
      await saveAveragesToUser(userProfile.id, averages);

      // Use a session or token to manage the login state
      req.session.user = userDoc;
      

      // Redirect to the user profile page on the frontend
      res.redirect(`http://localhost:3001/user`);
    } catch (dbError) {
      //console.error('Database error:', dbError);
      res.status(500).send(`Failed to save data to database: ${dbError.message}`);
    }
  });
});

router.get('/api/user', async (req, res) => {
  const db_connect = dbo.getDb();
  const usersCollection = db_connect.collection('users');

  // Assuming user information is stored in the session
  const userId = req.session.user && req.session.user.id;
  if (!userId) {
    return res.status(401).send('User not logged in');
  }

  try {
    const user = await usersCollection.findOne({ id: userId });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Failed to fetch user data');
  }
});

module.exports = router;