import React, { useState } from 'react';
import './Playlist/path.css';

const ExplorePath = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [userPath, setUserPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [songFeatures, setSongFeatures] = useState(null);
  const [rootNode, setRootNode] = useState(null); // To track the root of the tree


  const searchTracks = async () => {
    try {
      setLoading(true); // Set loading to true before starting the fetch
      const response = await fetch(`/api/search-tracks?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log("API Response:", data); // Debugging: Check API response
      await setSearchResults(data); // Update state with search results
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };




  
  const selectTrack = async (track) => {
    await initializeStartingNode(track);
  };



  const getFeatures = async (trackId) => {
    try {
      const response = await fetch(`/api/audio-features?trackID=${trackId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }
      const data = await response.json();
      await setSongFeatures(data);

      console.log("selected track features", songFeatures);
      return data;
    } catch (error) {
      console.error('Error fetching audio features:', error);
      return null;
    }
  };

  const TreeNode = ({ node, onSelect }) => {
    return (
      <div className="tree-node">
        <div
          className={`node ${node.isActive ? "active" : ""}`}
          onClick={() => onSelect(node)}
        >
          <img src={node.image} alt={node.name} width="50" />
          <p>{node.name}</p>
          <p>{node.artists.join(", ")}</p>
        </div>
  
        {node.nextOptions && node.nextOptions.length > 0 && (
          <div className="child-nodes">
            {node.nextOptions.map((childNode) => (
              <TreeNode key={childNode.id} node={childNode} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  
  // **INITIALIZATION FUNCTION**: Called when user selects a starting song
  const initializeStartingNode = async (track) => {
    await getFeatures(track.id);
    console.log("selected track features", songFeatures);
    const startingNode = {
      id: track.id,
      type: "song",
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: track.album.images[0]?.url || "default_image_url",
      features: songFeatures,
      isActive: true, // Mark root node as active initially

    };
    await setRootNode(startingNode);
    await setCurrentNode(startingNode); // Set current node
    await setUserPath([startingNode]); // Add starting node to user path history
    await fetchNextOptions(startingNode); // Fetch next options
  };


  const createNode = (track, parent) => {
    const node = {
      id: track.id,
      type: "song",
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      image: track.album.images[0]?.url || "default_image_url",
      features: null,
      parent: parent,
      nextOptions: [], // Placeholder for children
      isActive: false, // Field to track active state
    };
  
    // Add node to the global nodes array
    setUserPath((prevNodes) => [...prevNodes, node]);
  
    return node;
  };
  
  
  // Fetch recommendations for the given node to populate next options
  const fetchNextOptions = async (node) => {
    if (! node.features) {
      node.features = await getFeatures(node.id);
    }
    console.log("node:", node);
    console.log("pathrecom body", node.features, node.id);
    const songFeatures = node.features;
    const seedTrack = node.id;
    try {
      const response = await fetch(`/api/pathrecommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({songFeatures,  seedTrack}),
        credentials: 'include'
      });

      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();

      const nextNodes = data.tracks.map((track) => createNode(track, node));
      setCurrentNode({ ...node, nextOptions: nextNodes });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  // Select a node as the next step in the journey
  const selectNode = async (node) => {
      // Deactivate siblings
    if (node.parent) {
      node.parent.nextOptions.forEach((sibling) => (sibling.isActive = false));
    }
  
    // Mark the selected node as active
    node.isActive = true;
  
    // Add the selected node to the user path
    setUserPath([...userPath, node]);
  
    // Set the selected node as the current node
    setCurrentNode(node);
    
    await setUserPath([...userPath, node]);
    await setCurrentNode(node); 
    await fetchNextOptions(node);
  };

  return (
    <div>
      <h2>Start Your Music Journey</h2>
      {!rootNode ? (
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
            <p>Loading...</p>
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
        <div className="tree-container">
          <TreeNode node={rootNode} onSelect={selectNode} /> {/* Always start rendering from root */}
        </div>
      )}
    </div>
  );
}  

export default ExplorePath;
