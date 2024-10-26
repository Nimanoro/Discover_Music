const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
router.get(`/api/audio-features`, async (req, res) => {
    const {trackId} = req.query;
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
    try { 
        const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
        });

        if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch audio features: ${errorText}`);
        }

        const data = await response.json();
        if (!data) {
        throw new Error('Failed to parse response from Spotify API');
        }
        const features = {
            danceability: data.danceability,
            energy: data.energy,
            key: data.key,
            loudness: data.loudness,
            mode: data.mode,
            speechiness: data.speechiness,
            acousticness: data.acousticness,
            instrumentalness: data.instrumentalness,
            liveness: data.liveness,
            valence: data.valence,
            tempo: data.tempo,
            duration_ms: data.duration_ms,
            time_signature: data.time_signature
        }
        res.status(200).send(features);
    }
    catch (error) {
        res.status(500).send(`Failed to find features EEEerror on sending: ${error.message}`);
      }
});
module.exports = router;