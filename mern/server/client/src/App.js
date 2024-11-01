import React from "react";
import Navbar from "./Homepage_components/Navbar";
import User from "./Login/user";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Homepage_components/Home.js";
import First from "./Playlist/First.js";
import ExplorePath from "./ExplorePath.js";
import { Helmet } from 'react-helmet';

export default function App() {
  return (
    <body> 
      <Helmet>
            <title>Discover music</title>
        </Helmet>
      <div className="body-font">
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/my_profile' element={<User/>} />
        <Route exact path='/user' element={<User/>} />
        <Route exact path = '/make_playlist' element={<First/>} />
        <Route exact path = '/by-song' element={<First/>} />
        <Route exact path = '/path' element={<ExplorePath/>} />

      </Routes>
    </div>
    <div>

    </div>
    </body>
  );
}