import React from "react";
import Navbar from "./Homepage_components/Navbar";
import Database from "./Database/Database"
import Login from "./Login/login.js"
import User from "./Login/user.js";
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from "./Homepage_components/Home.js";
import First from "./Playlist/First.js";
import { Helmet } from 'react-helmet';


export default function App() {
  return (
    <body> 
      <Helmet>
            <title>Discover music</title>
        </Helmet>
      <div className="text-gray-400 bg-gray-900 body-font">
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/my_profile' element={<User/>} />
        <Route exact path='/user' element={<User/>} />
        <Route exact path = '/make_playlist' element={<First/>} />


      </Routes>
    </div>
    <div>

    </div>
    </body>
  );
}