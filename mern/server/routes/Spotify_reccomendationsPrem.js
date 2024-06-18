const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const { generatePlaylistName, generateCoverArt } = require('./OpenAi');
const axios = require('axios');
const sharp = require('sharp');

console.log("spotify_recommendationsPrem.js loaded");

router.post('/api/recommendationsPrem', async (req, res) => {
  console.log('POST /api/recommendationsPrem');
  const { adjustedAverages, seedTrack, user_mood } = req.body;
  console.log('Adjusted Averages:', adjustedAverages);
  console.log('Seed Track:', seedTrack);

  const accessToken = req.session.access_token;
  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const url = `https://api.spotify.com/v1/recommendations?limit=30&seed_tracks=${seedTrack}&target_danceability=${adjustedAverages.danceability}&target_energy=${adjustedAverages.energy}&target_key=${adjustedAverages.key}&target_loudness=${adjustedAverages.loudness}&target_mode=${adjustedAverages.mode}&target_speechiness=${adjustedAverages.speechiness}&target_acousticness=${adjustedAverages.acousticness}&target_instrumentalness=${adjustedAverages.instrumentalness}&target_liveness=${adjustedAverages.liveness}&target_valence=${adjustedAverages.valence}&target_tempo=${adjustedAverages.tempo}`;

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
    const recommendedTracks = data.tracks.map(track => track.uri);

    // Fetch the seed track to get the image
    let seedTrackData;
    try {
      const seedTrackResponse = await fetch(`https://api.spotify.com/v1/tracks/${seedTrack}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!seedTrackResponse.ok) {
        const errorText = await seedTrackResponse.text();
        throw new Error(`Failed to fetch seed track: ${errorText}`);
      }

      seedTrackData = await seedTrackResponse.json();
      console.log("Seed Track Data:", seedTrackData);
      img = seedTrackData.album.images[0]?.url;
      user_mood.song = [seedTrackData.name, seedTrackData.artists[0].name];
    } catch (error) {
      console.error(`Failed to fetch seed track: ${error.message}`);
    }

    const userId = req.session.userID;

    // Generate creative playlist name
    const playlistName = await generatePlaylistName(user_mood);

    // Generate cover art
    const coverArtUrl = await generateCoverArt(user_mood);

    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: playlistName,
        description: `generated by discover music app on ${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()}`, 
        public: true
      })
    });

    if (!createPlaylistResponse.ok) {
      const errorText = await createPlaylistResponse.text();
      console.error('Error creating playlist:', errorText);
      throw new Error(`Failed to create playlist: ${errorText}`);
    }
    

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

    const db_connect = dbo.getDb();
    const usersCollection = db_connect.collection('users');
    await usersCollection.updateOne(
      { id: userId },
      { $push: { playlists: { id: playlistData.id, name: playlistData.name, image: coverArtUrl } } }
    );
    console.log('Playlist added to user profile');
    const jpeg = await convertWebPToBase64JPEG(coverArtUrl);
    await uploadCoverArtToSpotify(playlistId, jpeg, accessToken);
    res.json({
      playlistId,
      playlistName: playlistData.name,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`,
      playlistImage: coverArtUrl,
      tracks: data.tracks
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Failed to create playlist and add tracks: ${error.message}`);
  }


 

async function convertWebPToBase64JPEG(webpUri) {
  try {
    // Fetch the WebP image from the URI
    const response = await axios.get(webpUri, { responseType: 'arraybuffer' });
    const webpBuffer = Buffer.from(response.data, 'binary');

    // Convert WebP buffer to JPEG buffer
    const jpegBuffer = await sharp(webpBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();

    // Convert JPEG buffer to Base64
    const base64String = jpegBuffer.toString('base64');

    // Ensure the Base64 string is below 256 KB
    const base64Size = Buffer.byteLength(base64String, 'base64');
    if (base64Size > 256 * 1024) {
      throw new Error('Base64 encoded image exceeds 256 KB');
    }

    return base64String;
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
}

async function uploadCoverArtToSpotify(playlistId, base64Image, accessToken) {
  const imageData = base64Image; // Directly use the base64 encoded string

  try {
    const response = await axios({
      method: 'put',
      url: `https://api.spotify.com/v1/playlists/${playlistId}/images`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'image/jpeg'
      },
      data: Buffer.from(imageData, 'base64')
    });

    if (response.status !== 202) {
      throw new Error('Failed to upload cover art to Spotify');
    }

    console.log('Cover art uploaded successfully');
  } catch (error) {
    console.error('Error uploading cover art:', error);
    throw error;
  }


  convertWebPToBase64JPEG(webpUri)
    .then(base64Image => {
      return uploadCoverArtToSpotify(playlistId, base64Image, accessToken);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

});

module.exports = router;