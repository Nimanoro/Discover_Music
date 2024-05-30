import React, { useEffect, useState } from 'react';

const First = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:2800/api/user', {
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
  }, []);

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
          <h2>Hi, {userProfile.display_name}</h2>
          {userProfile.images && userProfile.images.length > 0 && (
            <img src={userProfile.images[0].url} alt="User profile" />
          )}

          </div>
      ) : (
        <p>No user profile data available</p>
      )}
    <div>
      Let's make you a playlist!

      <body>first I am gonna ask you some questions...</body>


    </div>
    


    </div>
  );
  
}

export default First;