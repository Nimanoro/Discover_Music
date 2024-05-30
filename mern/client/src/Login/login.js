import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const Login = () => {
  const query = useQuery();
  const accessToken = query.get('access_token');

  useEffect(() => {
    if (accessToken) {
      // Store token and use it for API requests
      localStorage.setItem('spotify_access_token', accessToken);
    }
  }, [accessToken]);

  return (
    <div>
      <a href="http://localhost:8888/login">Login with Spotify</a>
    </div>
  );
}

export default Login;
