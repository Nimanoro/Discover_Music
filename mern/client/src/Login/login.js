import React from 'react';
const Login = () => {
  const scope = process.env.REACT_APP_SCOPE;
  const clientId = process.env.REACT_APP_CLIENTID;
  const redirectUri = process.env.REACT_APP_REDIRECTURI;

  const loginWithSpotify = () => {
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  };

  return (
    <button onClick={loginWithSpotify}>Login with Spotify</button>
  );
};

export default Login;
