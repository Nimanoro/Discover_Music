import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const User = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const queryParams = new URLSearchParams(location.search);

      try {
        const response = await fetch(`http://localhost:2800/api/user`, {
          credentials: 'include' // Ensure cookies are included in the request
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user data: ${errorText}`);
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [location.search]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      {userProfile ? (
        <div>
          <h2>Welcome, {userProfile.display_name}</h2>
          {userProfile.images && userProfile.images.length > 0 && (
            <img src={userProfile.images[0].url} alt="User profile" />
          )}
          <p>Email: {userProfile.email}</p>
          <h3>Recently Played Tracks:</h3>
          <ul>
            {userProfile.recentlyPlayed && userProfile.recentlyPlayed.map((item, index) => (
              <li key={index}>
                {item.track.name} by {item.track.artists.map(artist => artist.name).join(', ')}
              </li>
            ))}
          </ul>
          <h3>Audio Feature Averages:</h3>
          <ul>
            {userProfile.audioFeaturesAverages && Object.entries(userProfile.audioFeaturesAverages).map(([key, value]) => (
              <li key={key}>{key}: {value.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No user profile data available</p>
      )}
    </div>
  );
};

export default User;
