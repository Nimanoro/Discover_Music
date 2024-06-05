import React, { useEffect, useState } from 'react';
import Questions from './questions';
import './quiz.css';

const First = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [selectedAnswerIndexes, setSelectedAnswerIndexes] = useState([]);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [averages, setAverages] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [playlistDetails, setPlaylistDetails] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

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
        setUserProfile(data);

        if (data.audioFeaturesAverages) {
          setAverages(data.audioFeaturesAverages);
        } else {
          setError('User profile does not have audio features averages');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const { questions } = Questions;
  const { question, choices, correctAnswer, type } = questions[activeQuestion];

  const onClickNext = () => {
    if (type === 'Written') {
      setSelectedAnswer(writtenAnswer);
    }
    setSelectedAnswerIndex(null);
    setWrittenAnswer('');
    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      adjustAverages();
      setShowResult(true);
    }
  };

  const onClickSkip = () => {
    setSelectedAnswerIndex(null);
    setWrittenAnswer('');
    if (activeQuestion !== questions.length - 1) {
      setActiveQuestion((prev) => prev + 1);
    } else {
      adjustAverages();
      setShowResult(true);
    }
  };

  const onAnswerSelected = (answer, index) => {
    setSelectedAnswerIndex(index);
    setSelectedAnswerIndexes([...selectedAnswerIndexes, index]);
    if (answer === correctAnswer) {
      setSelectedAnswer(true);
    } else {
      setSelectedAnswer(false);
    }
  };


  const searchTracks = async () => {
    try {
      const response = await fetch(`http://localhost:2800/api/search-tracks?query=${encodeURIComponent(writtenAnswer)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const selectTrack = (track) => {
    setSelectedTrack(track);
    setSearchResults([]);
    setWrittenAnswer(track.name + ' by ' + track.artists.map((artist) => artist.name).join(', '));
  };
  const user_mood = { mood: '', activity: '', song: '', environment: ''};
  const adjustAverages = () => {
    const userResponses = {
      premium: questions[0].choices[selectedAnswerIndexes[0]],
      mood: questions[1].choices[selectedAnswerIndexes[1]],
      activity: questions[2].choices[selectedAnswerIndexes[2]],
      song: selectedTrack ? selectedTrack.id : writtenAnswer,
      environment: questions[4].choices[selectedAnswerIndexes[3]]
    };
    console.log(userResponses);


    let newAverages = { ...averages };

    if (userResponses.mood === 'Energetic') {
      user_mood.mood = 'Energetic';
      newAverages.energy += 0.1;
      newAverages.tempo += 5;
    } else if (userResponses.mood === 'Calm') {
      newAverages.energy -= 0.1;
      newAverages.tempo -= 5;
      user_mood.mood = 'calm';
    } else if (userResponses.mood === 'Happy') {
      newAverages.valence += 0.1;
      user_mood.mood = 'Happy';
    } else if (userResponses.mood === 'Sad') {
      newAverages.valence -= 0.1;
      user_mood.mood = 'Sad';
    } else if (userResponses.mood=== 'Stressed') {
      newAverages.energy -= 0.3;
      newAverages.tempo -= 10;
      user_mood.mood = 'Stressed';
    }
    

    if (userResponses.activity === 'Exercising') {
      newAverages.energy += 0.1;
      newAverages.tempo += 10;
      user_mood.activity = 'Exercising';

    } else if (userResponses.activity === 'Relaxing') {
      newAverages.energy -= 0.1;
      newAverages.tempo -= 5;
      newAverages.acousticness += 0.1;
      user_mood.activity = 'Relaxing';
    } else if (userResponses.activity === 'Working') {
      newAverages.energy += 0.1;
      newAverages.tempo += 5;
      user_mood.activity = 'Working';
    } else if (userResponses.activity === 'Commuting') {
      newAverages.energy += 0.2;
      newAverages.tempo -= 5;
      user_mood.activity = 'Commuting';
    } 

    if (userResponses.environment === 'Quiet') {
      newAverages.liveness -= 0.1;
      user_mood.environment = 'Quiet';
    } else if (userResponses.environment === 'Noisy') {
      newAverages.liveness += 0.1;
      user_mood.environment = 'Noisy';
    }
    newAverages.tempo = Math.round(newAverages.tempo);
    newAverages.key = Math.round(newAverages.key);
    newAverages.mode = Math.round(newAverages.mode);
    setAverages(newAverages);
    if (userResponses.premium === 'Yes') {
      getRecommendationsPrem(newAverages);
    } else {
    getRecommendations(newAverages);
    }
  };

  const getRecommendations = async (adjustedAverages) => {
    try {
      const response = await fetch('http://localhost:2800/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adjustedAverages, seedTrack: selectedTrack ? selectedTrack.id : null , user_mood: user_mood}),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data.tracks);
      setPlaylistDetails({
        name: data.playlistName,
        image: data.playlistImage,
        id: data.playlistId
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const getRecommendationsPrem = async (adjustedAverages) => {
    try {
      const response = await fetch('http://localhost:2800/api/recommendationsPrem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adjustedAverages, seedTrack: selectedTrack ? selectedTrack.id : null , user_mood: user_mood}),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data.tracks);
      setPlaylistDetails({
        name: data.playlistName,
        image: data.playlistImage,
        id: data.playlistId
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const addLeadingZero = (number) => (number > 9 ? number : `0${number}`);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="quiz-container">
      {!userProfile ? (
        <p>No user profile data available</p>
      ) : (
        <div>
          <h2>Hi, {userProfile.display_name}</h2>
          {userProfile.images && userProfile.images.length > 0 && (
            <img src={userProfile.images[0].url} alt="User profile" />
          )}
          <div>
            Let's make you a playlist!
            <p>First, I am gonna ask you some questions...</p>
          </div>
        </div>
      )}
      <div>
        {!showResult ? (
          <div>
            <div>
              <span className="active-question-no">{addLeadingZero(activeQuestion + 1)}</span>
              <span className="total-question">/{addLeadingZero(questions.length)}</span>
            </div>
            <h2>{question}</h2>
            {type === 'MCQs' ? (
              <ul>
                {choices.map((answer, index) => (
                  <li
                    onClick={() => onAnswerSelected(answer, index)}
                    key={answer}
                    className={selectedAnswerIndex === index ? 'selected-answer' : null}
                  >
                    {answer}
                  </li>
                ))}
              </ul>
            ) : (
              <div>
                <input
                  type="text"
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  placeholder="Type your answer here"
                />
                <button onClick={searchTracks}>Search</button>
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
            )}
            <div className="flex-right">
              <button onClick={onClickSkip}>
                Skip
              </button>
              <button onClick={onClickNext} disabled={selectedAnswerIndex === null && writtenAnswer === ''}>
                {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        ) : (
  
          <div className="result">
            {playlistDetails && (
              <div>
                <h3>{playlistDetails.name}</h3>
                <a href={`https://open.spotify.com/playlist/${playlistDetails.id}`} target="_blank" rel="noopener noreferrer">Open Playlist</a>

                {playlistDetails.image && (
                  <img src={playlistDetails.image} alt={playlistDetails.name} width="200" height="200" />
                )}
              </div>
            )}
            <h3>Recommended Tracks</h3>
            <ul>
              {recommendations.map((track) => (
                <li key={track.id}>
                  {track.album && track.album.images && track.album.images.length > 0 ? (
                    <img src={track.album.images[0].url} alt={track.name} width="50" height="50" />
                  ) : (
                    <img src="default_image_url" alt="Default" width="50" height="50" />
                  )}
                  <p>{track.name} by {track.artists.map(artist => artist.name).join(', ')}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default First;
