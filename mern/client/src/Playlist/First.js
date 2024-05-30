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
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [averages, setAverages] = useState(null); // Initially null
  const [recommendations, setRecommendations] = useState([]);

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

        // Set audio features averages
        if (data.audioFeaturesAverages) {
          setAverages(data.audioFeaturesAverages);
        } else {
          setAverages({
            danceability: 0.75865,
            energy: 0.5679000000000001,
            key: 5.1,
            loudness: -6.8530500000000005,
            mode: 0.4,
            speechiness: 0.18487,
            acousticness: 0.23434135000000006,
            instrumentalness: 0.012120876,
            liveness: 0.21146000000000004,
            valence: 0.429,
            tempo: 123.76
          });
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
    if (answer === correctAnswer) {
      setSelectedAnswer(true);
    } else {
      setSelectedAnswer(false);
    }
  };

  const adjustAverages = () => {
    const userResponses = {
      mood: questions[0].choices[selectedAnswerIndex],
      activity: questions[1].choices[selectedAnswerIndex],
      song: writtenAnswer,
      environment: questions[3].choices[selectedAnswerIndex]
    };

    let newAverages = { ...averages };

    if (userResponses.mood === 'Energetic') {
      newAverages.energy += 0.1;
      newAverages.tempo += 5;
    } else if (userResponses.mood === 'Calm') {
      newAverages.energy -= 0.1;
      newAverages.tempo -= 5;
    }

    if (userResponses.activity === 'Exercising') {
      newAverages.energy += 0.1;
      newAverages.tempo += 10;
    } else if (userResponses.activity === 'Relaxing') {
      newAverages.energy -= 0.1;
      newAverages.tempo -= 5;

      newAverages.acousticness += 0.1;
    }

    if (userResponses.environment === 'quiet') {
      newAverages.liveness -= 0.1;
    } else if (userResponses.environment === 'noisy') {
      newAverages.liveness += 0.1;
    }
    newAverages.tempo = Math.round(newAverages.tempo);
    newAverages.key = Math.round(newAverages.key);
    newAverages.mode = Math.round(newAverages.mode);
    setAverages(newAverages);

    getRecommendations(newAverages);
  };

  const getRecommendations = async (adjustedAverages) => {
    try {
      const response = await fetch('http://localhost:2800/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adjustedAverages }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data);
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
              <input
                type="text"
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Type your answer here"
              />
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
            <h3>Recommended Tracks</h3>
            <ul>
              {recommendations.map((track) => (
                <li key={track.id}>
                  <img src={track.album.images[0].url} alt={track.name} width="50" height="50" />
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
