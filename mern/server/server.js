const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const deleteRouter = require('./routes/Deletion');
const bodyParser = require('body-parser');
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 2800;
const spotifyLogin = require("./routes/Spotify_login");
const recommendationsRouter = require('./routes/Spotify_reccomendations')
const dbo = require("./db/conn");
const userRouter = require('./routes/User');
const searchRouter = require('./routes/Search');
const recommendationsPremRouter = require('./routes/Spotify_reccomendationsPrem');
const dotenv = require('dotenv');
var cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'none',
    maxAge: 180 * 60 * 1000 } // 3 hours
}));


app.use(cors({
  origin: 'https://discover-music-1.onrender.com', // Allow requests from this origin
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());

app.use('/spotify', spotifyLogin);
app.use(recommendationsPremRouter);
app.use(deleteRouter);
app.use(userRouter); 

app.use(recommendationsRouter);
app.use(searchRouter);


// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));
 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to log out');
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.sendStatus(200);
    
  });
});

app.listen(port, async () => {
  await dbo.connectToServer((err) => {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});
