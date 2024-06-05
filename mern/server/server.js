const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const bodyParser = require('body-parser');
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 2800;
const spotifyLogin = require("./routes/Spotify_login");
const recommendationsRouter = require('./routes/Spotify_reccomendations')
const dbo = require("./db/conn");
const searchRouter = require('./routes/Search');
const recommendationsPremRouter = require('./routes/Spotify_reccomendationsPrem');

const app = express();
app.use(bodyParser.json());


app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}));
app.use(cors({
  origin: 'http://localhost:3001', // Allow requests from this origin
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());

app.use('/spotify', spotifyLogin);
app.use(recommendationsPremRouter);

app.use(recommendationsRouter);
app.use(searchRouter);


// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("/api/user", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('User not logged in');
  }
  res.json(req.session.user);
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

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(port, async () => {
  await dbo.connectToServer((err) => {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});
