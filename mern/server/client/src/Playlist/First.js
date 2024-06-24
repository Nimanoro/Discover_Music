import React, { useEffect, useState } from 'react';
import Questions from './questions';
import './quiz.css';
import SpotifyIcon from './images/spotify_icon_green.png';




const First = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false); // New state to track if the quiz has started
  const API_URL = process.env.REACT_APP_API_URI;

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
  const startQuiz = () => {
    setQuizStarted(true);
  };
  

  

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/user`, {
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
      const response = await fetch(`/api/search-tracks?query=${encodeURIComponent(writtenAnswer)}`, {
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
      premium: false,
      mood: questions[1].choices[selectedAnswerIndexes[0]],
      activity: questions[2].choices[selectedAnswerIndexes[1]],
      song: selectedTrack ? selectedTrack.id : writtenAnswer,
      environment: questions[3].choices[selectedAnswerIndexes[2]]
    };
    console.log(userResponses);


    let newAverages = { ...averages };

    if (userResponses.mood === 'Energetic') {
      user_mood.mood = 'Energetic';
      newAverages.energy += 0.2;
      newAverages.tempo += 10;
    } else if (userResponses.mood === 'Calm') {
      newAverages.energy -= 0.2;
      newAverages.tempo -= 10;
      user_mood.mood = 'calm';
    } else if (userResponses.mood === 'Happy') {
      newAverages.valence += 0.2;
      newAverages.energy += 0.1;
      user_mood.mood = 'Happy';
    } else if (userResponses.mood === 'Sad') {
      newAverages.valence -= 0.2;
      user_mood.mood = 'Sad';
    } else if (userResponses.mood=== 'Stressed') {
      newAverages.energy -= 0.3;
      newAverages.valence += 0.1;
      newAverages.tempo -= 10;
      user_mood.mood = 'Stressed';
    }
    

    if (userResponses.activity === 'Exercising') {
      newAverages.energy += 0.2;
      newAverages.tempo += 10;
      user_mood.activity = 'Exercising';

    } else if (userResponses.activity === 'Relaxing') {
      newAverages.energy -= 0.2;
      newAverages.tempo -= 5;
      newAverages.acousticness += 0.1;
      user_mood.activity = 'Relaxing';
    } else if (userResponses.activity === 'Working') {
      newAverages.energy += 0.1;
      newAverages.tempo += 5;
      user_mood.activity = 'Working';
    } else if (userResponses.activity === 'Commuting') {
      newAverages.energy += 0.2;
      newAverages.valence -= 0.1;
      newAverages.tempo -= 5;
      user_mood.activity = 'Commuting';
    } 

    if (userResponses.environment === 'Quiet') {
      newAverages.liveness -= 0.2;
      user_mood.environment = 'Quiet';
    } else if (userResponses.environment === 'Noisy') {
      newAverages.liveness += 0.2;
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
      const response = await fetch(`/api/recommendations`, {
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
      const response = await fetch(`api/recommendationsPrem`, {
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
    <div>
      {!quizStarted ? (
  <div className="landing-page">
    {userProfile && (
      <>
        {userProfile.images && userProfile.images.length > 0 && (
          <img src={userProfile.images[0].url} alt="User profile" className="rounded-full w-32 h-32 mb-4" />
        )}
        <h2 className="text-2xl mb-4">Hello {userProfile.display_name} !</h2>
      </>
    )}
    <h2 className="text-3xl mb-4">Are you ready to make a new playlist?</h2>
      Let's make you a playlist!
      <p>First, I am gonna ask you some questions...</p>
    <button 
      className="btn-start bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded" 
      onClick={startQuiz}>
      I'm Ready
    </button>
  </div>
) : (
  
  <>
    <div>
      {!showResult ? (
        <div className="quiz-container">
          <div className='mb-2'>
          <div className="progress-circle" style={{ '--progress': `${(activeQuestion + 1) / questions.length * 100}%` }}>
          <div className="progress-content">
            {activeQuestion + 1}/{questions.length}
          </div>
          </div>

          </div>
          <h2 className='mb-7'>{question}</h2>
          {type === 'MCQs' ? (
            <ul className=''>
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
                className='h-11 rounded text-black border border-gray-400 focus:outline-none focus:border-blue-500 px-3 py-1 mb-3'
                type="text"
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
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
          )}
          <div className='flex-right ml-5'>
          {questions[activeQuestion].type !== 'written' (
            <button onClick={onClickSkip}>
              Skip
            </button>
          )}
            <button onClick={onClickNext} disabled={selectedAnswerIndex === null && writtenAnswer === ''}>
              {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      ) : (
        <div className="result quiz-container">
          {playlistDetails && (
            <div>
              <h3>{playlistDetails.name}</h3>
              
        
              {playlistDetails.image && (
                <img src={playlistDetails.image} alt={playlistDetails.name} className='center-but mb-2' width="200" height="200" />
                
              )}
              <a href={`https://open.spotify.com/playlist/${playlistDetails.id}`} target="_blank" rel="noopener noreferrer">
              <button 
                className="w-1/3 center-but"
                type="button"
              >
              
                <img className="center" src={SpotifyIcon} alt="Play on Spotify"/>
              </button>
              </a>
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
  </>

)}
</div>
)}

export default First;
