import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './user.css';

const User = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');
  const playlistsPerPage = 16;
  const [showPopup, setShowPopup] = useState(false); 

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

      setUserProfile(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const sortPlaylists = (playlists) => {
    switch (sortOption) {
      case 'newest':
        return playlists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return playlists.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'name':
        return playlists.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return playlists;
    }
  };

  const renderPlaylists = () => {
    if (!userProfile || !userProfile.playlists || userProfile.playlists.length === 0) {
      return <p>No playlists available.</p>;
    }

    const sortedPlaylists = sortPlaylists([...userProfile.playlists]);
    const indexOfLastPlaylist = currentPage * playlistsPerPage;
    const indexOfFirstPlaylist = indexOfLastPlaylist - playlistsPerPage;
    const currentPlaylists = sortedPlaylists.slice(indexOfFirstPlaylist, indexOfLastPlaylist);

    return (
      <div className="playlist-grid">
        {currentPlaylists.map(playlist => (
          <div key={playlist.id} className="playlist-item">
            <div className="playlist-image-container">
              {playlist.image ? (
                <img src={playlist.image} alt={playlist.name} className="playlist-image" />
              ) : (
                <img src="default_image_url" alt="Default" className="playlist-image" />
              )}
              <div className="playlist-buttons">
                <button 
                  className="btn-play"
                  type="button"
                  onClick={() => playPlaylist(playlist.id)}
                >
                  ▶
                </button>
                <button 
                  className="btn-trash"
                  type="button"
                  onClick={() => removePlaylist(playlist.id)}
                >
                  <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className='align-middle'>{playlist.name}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const totalPages = Math.ceil(userProfile.playlists.length / playlistsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * playlistsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * playlistsPerPage, userProfile.playlists.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{userProfile.playlists.length}</span> Entries
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          <button
            className="flex page-buttons items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            type="button"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
            <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
            </svg>
          </button>
          <button
            className="flex page-buttons items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            type="button"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderRecentlyPlayedTracks = () => {
    if (!userProfile || !userProfile.recentlyPlayed || userProfile.recentlyPlayed.length === 0) {
      return <p>No recently played tracks available.</p>;
    }

    return (
      <div className="recently-played-grid">
        {userProfile.recentlyPlayed.map(item => (
          <div key={item.track.id} className="recently-played-item">
            {item.track.album && item.track.album.images && item.track.album.images.length > 0 ? (
              <img src={item.track.album.images[0].url} alt={item.track.name} width="100" height="100" />
            ) : (
              <img src="default_image_url" alt="Default" width="100" height="100" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const playPlaylist = (playlistId) => {
    window.open(`https://open.spotify.com/playlist/${playlistId}`, '_blank');
  };

  const removePlaylist = async (playlistId) => {
    console.log(`Remove playlist ${playlistId}`);
    try {
      const response = await fetch('http://localhost:2800/api/deletion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playlistId }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }

      setShowPopup(true); // Show popup on successful deletion
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    fetchUserProfile(); // Refresh the user profile data
  };

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
          <div className='user-name'>Hi, {userProfile.display_name}</div>
          {userProfile.images && userProfile.images.length > 0 && (
            <img src={userProfile.images[0].url} alt="User profile" />
          )}

          <div className="user-section">
            <h3>Your Playlists</h3>
            <div className="sort-options">
              <label htmlFor="sort">Sort by: </label>
              <select id="sort" value={sortOption} onChange={handleSortChange}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
              </select>
            </div>
            {renderPlaylists()}
            {renderPagination()}
          </div>

          <div className="user-section">
            <h3>Recently Played Tracks</h3>
            {renderRecentlyPlayedTracks()}
          </div>
        </div>
      ) : (
        <p>No user profile data available</p>
      )}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>Playlist deleted successfully!</p>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default User;
