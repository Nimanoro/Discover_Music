import React from "react";
import Navbar from "./Homepage_components/Navbar";
import Database from "./Database/Database";
import User from "./user.js";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Homepage_components/Home.js";
import First from "./Playlist/First.js";
import { Helmet } from 'react-helmet';
import PlaylistsPage from "./Playlist/PlaylistPage.js";

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


      </Routes>
    </div>
    <div>

    </div>
    </body>
  );
}