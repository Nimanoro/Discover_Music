import React from "react";
import Navbar from "./Homepage_components/Navbar";
import Database from "./Database/Database"
import Login from "./Login/login.js"
import { HashRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <body> 
      <div className="text-gray-400 bg-gray-900 body-font">
      <Navbar />
      <Routes>
        <Route exact path='/database' element={<Database/>} />
        <Route exact path='/login' element={<Login/>} />

      </Routes>
    </div>
    <div>

    </div>
    </body>
  );
}