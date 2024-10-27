const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

router.get(`/api/audio-features`, async (req, res) => {
  const { trackID } = req.query;
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
    console.log("trackId: ", trackID);
    response = await fetch(`https://api.spotify.com/v1/audio-features/${trackID}`, {
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

  const audioFeatures = await response.json();

  
  
  res.send(audioFeatures);
});

module.exports = router;
