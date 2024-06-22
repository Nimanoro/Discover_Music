import React from 'react';
import shadowSinger from './images/Shadow-singer.png';
import vinyl from './images/vinyl.png';
import crown from './images/crown.png';
import suprise from './images/superise.png';

const PlaylistPage = () => {
  return (
    <div className="h-screen w-screen grid grid-cols-2 grid-rows-2">
      <button
        className="flex items-center justify-center text-white text-2xl h-full w-full"
        onClick={() => window.location.href = '/premium'}
      >
        <img src={crown} alt="Premium" className="w-1/3 h-1/2"/>
        <span className="absolute bottom-0 mb-4">Premium</span>
      </button>
      <button
        className="flex items-center justify-center  text-white text-2xl h-full w-full"
        onClick={() => window.location.href = '/by-song'}
      >
        <img src={shadowSinger}  alt="By Song" className="w-1/2 h-1/2 object-cover"/>
        <span className="absolute bottom-0 mb-4">By Song</span>
      </button>
      <button
        className="flex items-center justify-center text-white text-2xl h-full w-full"
        onClick={() => window.location.href = '/by-genre'}
      >
        <img src={vinyl}  alt="By Genre" className="w-1/3 h-1/2"/>
        <span className="absolute bottom-0 mb-4">By Genre</span>
      </button>
      <button
        className="flex items-center justify-center text-white text-2xl h-full w-full"
        onClick={() => window.location.href = '/surprise'}
      >
        <img src={suprise} alt="Surprise Yourself" className="w-1/3 h-1/2"/>
        <span className="absolute bottom-0 mb-4">Surprise Yourself!</span>
      </button>
    </div>
  );
};

export default PlaylistPage;
