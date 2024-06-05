import React, { useEffect, useState } from 'react';


const User = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:2800/api/user', {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user data: ${errorText}`);
        }
        const data = await response.json();
        //setError('User Profile:', data); // This line is different from the original code

        setUserProfile(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="user-container">
      {userProfile ? (
        <div>
          <h2>Hi, {userProfile.display_name}</h2>
          {userProfile.images && userProfile.images.length > 0 && (
            <img src={userProfile.images[0].url} alt="User profile" />
          )}

          <div className="user-section">
            <h3>Recently Played Tracks</h3>
            <ul>
              {userProfile.recentlyPlayed && userProfile.recentlyPlayed.length > 0 ? (
                userProfile.recentlyPlayed.map(item => (
                  <li key={item.track.id}>
                    {item.track.album && item.track.album.images && item.track.album.images.length > 0 ? (
                      <img src={item.track.album.images[0].url} alt={item.track.name} width="50" height="50" />
                    ) : (
                      <img src="default_image_url" alt="Default" width="50" height="50" />
                    )}
                    <p>{item.track.name} by {item.track.artists.map(artist => artist.name).join(', ')}</p>
                  </li>
                ))
              ) : (
                <p>No recently played tracks available.</p>
              )}
            </ul>
          </div>

          <div className="user-section">
            <h3>Your Playlists</h3>
            <ul>
              {userProfile.playlists && userProfile.playlists.length > 0 ? (
                userProfile.playlists.map(playlist => (
                  <li key={playlist.id}>
                    {playlist.image ? (
                      <img src={playlist.image} alt={playlist.name} width="50" height="50" />
                    ) : (
                      <img src="default_image_url" alt="Default" width="50" height="50" />
                    )}
                    <p>{playlist.name}</p>
                    <a href={`https://open.spotify.com/playlist/${playlist.id}`} target="_blank" rel="noopener noreferrer">Open Playlist</a>
                  </li>
                ))
              ) : (
                <p>No playlists available.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <p>No user profile data available</p>
      )}
    </div>
  );
};

export default User;
