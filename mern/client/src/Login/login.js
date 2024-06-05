import React from 'react';

const Login = () => {
  const scope = 'user-read-recently-played playlist-modify-private user-read-email user-top-read playlist-modify-public playlist-modify-public ugc-image-upload';
  const clientId = 'c45598b6ed004b3691abf893c3194eed';
  const redirectUri = 'http://localhost:2800/spotify/callback'; // Ensure this matches your server port

  const loginWithSpotify = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  };

  return (
    <button onClick={loginWithSpotify}>Login with Spotify</button>
  );
};

export default Login;
