
import React from 'react';
const loginWithSpotify = () => {
    const scope = process.env.REACT_APP_SCOPE;
    const clientId = process.env.REACT_APP_CLIENTID;
    const redirectUri = process.env.REACT_APP_REDIRECTURI;
    const uri = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    return uri;
  };

  export default loginWithSpotify;