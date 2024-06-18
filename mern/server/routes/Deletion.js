const fetch = require('node-fetch');
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');

router.delete('/api/deletion', async (req, res) => {
  const { playlistId } = req.body;
  const accessToken = req.session.access_token;
  console.log('Access Token:', accessToken);

  if (!accessToken) {
    console.error('Access token is missing or expired');
    return res.status(401).send('Access token is missing or expired');
  }

  try {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;

    console.log('Request URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting the playlist:', errorText);
      throw new Error(`Failed to delete playlist: ${errorText}`);
    }

    // Update the database to reflect the deletion if necessary
    const db_connect = dbo.getDb();
    const usersCollection = db_connect.collection('users');
    const userId = req.session.userID;

    await usersCollection.updateOne(
      { id: userId },
      { $pull: { playlists: { id: playlistId } } }
    );

    res.status(200).send('Playlist deleted successfully'); // Send plain text response
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Failed to delete playlist');
  }
});

module.exports = router;