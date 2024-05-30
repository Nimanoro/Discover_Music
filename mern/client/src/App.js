import React from "react";
import Navbar from "./Homepage_components/Navbar";
import Database from "./Database/Database"
import Login from "./Login/login.js"
import User from "./Login/user.js";
import { HashRouter, Routes, Route } from 'react-router-dom';
import First from "./Playlist/First.js";

export default function App() {
  return (
    <body> 
      <div className="text-gray-400 bg-gray-900 body-font">
      <Navbar />
      <Routes>
        <Route exact path='/database' element={<Database/>} />
        <Route exact path='/login' element={<Login/>} />
        <Route exact path='/User' element={<User/>} />
        <Route exact path='/my_profile' element={<User/>} />
        <Route exact path = '/generate' element={<First/>} />


      </Routes>
    </div>
    <div>

    </div>
    </body>
  );
}