import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import First from './First';
import '@testing-library/jest-dom/extend-expect';


describe('First component', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('renders the user profile', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      display_name: 'John Doe',
      images: [{ url: 'https://example.com/image.jpg' }],
      audioFeaturesAverages: {
        danceability: 0.5,
        energy: 0.6,
        key: 5,
        loudness: -5,
        mode: 1,
        speechiness: 0.1,
        acousticness: 0.2,
        instrumentalness: 0.3,
        liveness: 0.4,
        valence: 0.5,
        tempo: 120
      }
    }));

    render(<First />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    const userProfileName = await screen.findByText('Hi, John Doe');
    expect(userProfileName).toBeInTheDocument();
    expect(screen.getByAltText('User profile')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  test('allows selecting and submitting answers', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      display_name: 'John Doe',
      images: [{ url: 'https://example.com/image.jpg' }],
      audioFeaturesAverages: {
        danceability: 0.5,
        energy: 0.6,
        key: 5,
        loudness: -5,
        mode: 1,
        speechiness: 0.1,
        acousticness: 0.2,
        instrumentalness: 0.3,
        liveness: 0.4,
        valence: 0.5,
        tempo: 120
      }
    }));

    render(<First />);

    await screen.findByText('Hi, John Doe');

    const firstQuestion = await screen.findByText(/First Question Text/i);
    expect(firstQuestion).toBeInTheDocument();

    const answerOption = screen.getByText('First Answer Option');
    fireEvent.click(answerOption);
    expect(answerOption).toHaveClass('selected-answer');

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    const secondQuestion = await screen.findByText(/Second Question Text/i);
    expect(secondQuestion).toBeInTheDocument();
  });
});
