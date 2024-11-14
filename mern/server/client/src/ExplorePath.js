import React, { useState } from 'react';
import './Playlist/quiz.css';

const ExplorePath = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [userPath, setUserPath] = useState([]);
  const [loading, setLoading] = useState(false); // New loading state
  const [currentNodeFeatures, setCurrentNodeFeatures] = useState(null);
  // Function to handle search for the starting song

  const searchTracks = async () => {
    try {
      setLoading(true); // Set loading to true before starting the fetch
      const response = await fetch(`/api/search-tracks?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log("API Response:", data); // Debugging: Check API response
      setSearchResults(data); // Update state with search results
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };

  // Function to handle selecting a track from search results
  const selectTrack = (track) => {
    initializeStartingNode(track);
  };

  // Function to get audio features for a given track
  const getFeatures = async (trackId) => {
    try {
      const response = await fetch(`/api/audio-features?trackID=${trackId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      return data; // Return audio features for the given track
    } catch (error) {
      console.error('Error fetching audio features:', error);
      return {}; // Return empty object on error
    }
  };

  // **INITIALIZATION FUNCTION**: Called when user selects a starting song
  const initializeStartingNode = async (track) => {
    const trackFeatures = await getFeatures(track.id); // Fetch features
    setCurrentNodeFeatures(trackFeatures);
    const startingNode = {
      id: track.id,
      type: "song",
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: track.album.images[0]?.url || "default_image_url",
      features: trackFeatures,
    };

    setCurrentNode(startingNode); // Set current node
    setUserPath([startingNode]); // Add starting node to user path history
    await fetchNextOptions(startingNode); // Fetch next options
  };

  // Fetch recommendations for the given node to populate next options
  const fetchNextOptions = async (node) => {

    try {
      const response = await fetch(`/api/pathrecommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackFeatures, seedTrack: node.id }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();

      const nextNodes = data.tracks.map((track) => ({
        id: track.id,
        type: "song",
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        image: track.album.images[0]?.url || "default_image_url",
      }));
      setCurrentNode({ ...node, nextOptions: nextNodes });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Select a node as the next step in the journey
  const selectNode = (node) => {
    setUserPath([...userPath, node]); // Add selected node to path
    setCurrentNode(node); // Set it as current node
    fetchNextOptions(node); // Fetch recommendations for the new current node
  };

  return (
    <div>
      <h2>Start Your Music Journey</h2>
      {!currentNode ? (
        <div>
          <input
            className='h-11 rounded text-black border border-gray-400 focus:outline-none focus:border-blue-500 px-3 py-1 mb-3'
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=" e.g. 'Shape of You' or ed sheeran"
          />
          <button onClick={searchTracks}>Search</button>
          {loading ? (
            <p>Loading...</p> // Display loading message while fetching data
          ) : (
            <ul>
            {searchResults.map((track) => (
              <li key={track.id} onClick={() => selectTrack(track)}>
                {track.album && track.album.images && track.album.images.length > 0 ? (
                  <img src={track.album.images[0].url} alt={track.name} width="50" height="50" />
                ) : (
                  <img src="default_image_url" alt="Default" width="50" height="50" />
                )}
                {track.name} by {track.artists.map(artist => artist.name).join(', ')}
              </li>
            ))}
          </ul>
          )}
        </div>
      ) : (
        <div>
          <h3>{currentNode.name} by {currentNode.artists.join(', ')}</h3>
          <img src={currentNode.image} alt={currentNode.name} width="100" />
          <h4>Choose Your Next Stop:</h4>
          <ul>
            {currentNode.nextOptions && currentNode.nextOptions.length > 0 ? (
              currentNode.nextOptions.map((option) => (
                <li key={option.id} onClick={() => selectNode(option)}>
                  {option.name} by {option.artists.join(', ')}
                </li>
              ))
            ) : (
              <li>No next options available.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExplorePath;
