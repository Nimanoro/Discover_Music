import React, { useState, useEffect } from 'react';

const ExplorePath = () => {
  const [searchQuery, setSearchQuery] = useState('');          // For user to search starting song
  const [searchResults, setSearchResults] = useState([]);      // Results from song search
  const [currentNode, setCurrentNode] = useState(null);        // Current node in the path
  const [userPath, setUserPath] = useState([]);                // User’s journey through nodes

  // Function to handle search for the starting song
  const handleSearch = async () => {
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

  // **INITIALIZATION FUNCTION**: Called when user selects a starting song
  const initializeStartingNode = (track) => {
    const startingNode = {
      id: track.id,
      type: "song",
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: track.album.images[0]?.url || "default_image_url",
      attributes: {  // Audio features or initial attributes if applicable
        energy: track.energy,
        tempo: track.tempo,
        valence: track.valence,
      }
    };

    setCurrentNode(startingNode);    // Set the current node to this starting node
    setUserPath([startingNode]);     // Add starting node to user path history
    fetchNextOptions(startingNode);  // Fetch initial recommendations for the first set of options
    setSearchResults([]);            // Clear search results after selection
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
            type="text"
            placeholder="Search for a song or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <ul>
            {searchResults.map((track) => (
              <li key={track.id} onClick={() => initializeStartingNode(track)}>
                {track.name} by {track.artists.map((artist) => artist.name).join(', ')}
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
