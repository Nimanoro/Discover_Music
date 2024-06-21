const dbo = require("../db/conn");
const express = require('express');
const router = express.Router();

router.get('/api/user', async (req, res) => {
    const db_connect = dbo.getDb();
    const usersCollection = db_connect.collection('users');
  
    const userId = req.session.userID;
  
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
  