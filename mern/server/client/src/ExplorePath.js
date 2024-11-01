import React, { useState, useEffect } from 'react';
import './Playlist/quiz.css';
const ExplorePath = () => {
  const [searchQuery, setSearchQuery] = useState('');          // For user to search starting song
  const [searchResults, setSearchResults] = useState([]);      // Results from song search
  const [currentNode, setCurrentNode] = useState(null);        // Current node in the path
  const [userPath, setUserPath] = useState([]);     // Audio features for a given track
  const [selectedTrack, setSelectedTrack]  = useState(null);  // Track selected by the user        

  // Function to handle search for the starting song
  const searchTracks = async () => {
    try {
      const response = await fetch(`/api/search-tracks?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setSearchResults(data.tracks); // Display search results for the user to choose from
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  const selectTrack = (track) => {
    setSelectedTrack(track);
    setSearchResults([]);    
    initializeStartingNode(selectedTrack); // Initialize the starting node with the selected
    getFeatures(selectedTrack.id); // Fetch audio features for the selected track
  };

  // Function to get audio features for a given track
  const getFeatures = async (trackId) => {
    try {
      const response = await fetch(`/api/audio-features?trackId=${trackId}`, {
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
    const trackFeatures = await getFeatures(track.id);  // Fetch and directly use features
    const startingNode = {
      id: track.id,
      type: "song",
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: track.album.images[0]?.url || "default_image_url",
      features: trackFeatures,
    };

    setCurrentNode(startingNode);    // Set the current node to this starting node
    setUserPath([startingNode]);     // Add starting node to user path history
    fetchNextOptions(startingNode);        // Clear search results after selection
  };

  // Fetch recommendations for the given node to populate next options
  const fetchNextOptions = async (node) => {
    try {
      const response = await fetch(`/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedTrack: node.id }),
        credentials: 'include',
      });
      const data = await response.json();

      const nextNodes = data.tracks.map((track) => ({
        id: track.id,
        type: "song",
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        image: track.album.images[0]?.url || "default_image_url",
        attributes: {
          energy: track.energy,
          tempo: track.tempo,
          valence: track.valence,
        }
      }));
      setCurrentNode({ ...node, nextOptions: nextNodes });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Select a node as the next step in the journey
  const selectNode = (node) => {
    setUserPath([...userPath, node]); // Add selected node to path
    setCurrentNode(node);             // Set it as current node
    fetchNextOptions(node);           // Fetch recommendations for the new current node
  };

  return (
    <div>
      <h2>Start Your Music Journey</h2>
      {!currentNode ? (
        <div>
          <input
            className='h-11 rounded text-black border border-gray-400 focus:outline-none focus:border-blue-500 px-3 py-1 mb-3'
            type="text"
            value={searchQuery} // Use searchQuery for clarity
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=" e.g. 'Shape of You' or ed sheeran"
          />
          <button className="" onClick={searchTracks}>Search</button>
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
        </div>
      ) : (
        <div>
          <h3>{currentNode.name} by {currentNode.artists.join(', ')}</h3>
          <img src={currentNode.image} alt={currentNode.name} width="100" />
          <h4>Choose Your Next Stop:</h4>
          <ul>
            {currentNode.nextOptions.map((option) => (
              <li key={option.id} onClick={() => selectNode(option)}>
                {option.name} by {option.artists.join(', ')}
              </li>
            ))}
          </ul>
        
        </div>
      )}
    </div>
  );
};

export default ExplorePath;
