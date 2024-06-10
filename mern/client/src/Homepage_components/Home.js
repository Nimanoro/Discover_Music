import React from "react";
import "./Home.css"
import { useState, useEffect } from "react";
import colorfulHeadphones from './images/colorfulheadphones.png';


const Home = () =>{

    const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by making a request to the backend
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:2800/api/user', {
          credentials: 'include' // Ensure cookies are included in the request
        });
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <section id="about" className="h-100% w-100%  m-0 p-0 overflow-x-hidden overflow-y-hidden">
      <div className="container mx-auto flex px-10 py-20 md:flex-row flex-col items-center">
        <div className="px-10 sm:px-20 py-10">
        </div>
        <div className="w-100% h-90% sm:w-50% sm:h-50% justify-end lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <div className= "wrapper">
            <div 
            className="text-center typing title-font sm:text-4xl text-3xl mb-4 font-medium text-white pb:2vh">
            Hey there, I'm Discover Music!
            </div>
           <p className="mb-10 mx-10 text-center m-20 text-lg sm:text-md px-10 sm:px-0 text-white">
           I am here to help you discover new music.
           I am a music recommendation system that will help you find new music based on your preferences and your mood.
          </p>
          <img className="w-50% h-50%" src={colorfulHeadphones} alt="music" />
          </div>
          {isLoggedIn ? ( 
            <div className="flex px-20 md:px-20 justify-items-center align-center">
            <a
              href='/make_playlist'
              className="mr-4 inline-flex  text-center btn-5 text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg">
              <span>create a new playlist </span>
            </a>
            <a
              href="/User"
              className="ml-4 text-center btn-5 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">
               <span>Your user profile</span>
              
            </a>
            </div>
          ): (
            
          <div className="flex px-20 md:px-20 justify-items-center align-center">
            <a
              href="/Login"
              className="mr-4 inline-flex  text-center btn-5 text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg">
              <span>Login</span>
            </a>
            <a
              href="/User"
              className="ml-4 text-center btn-5 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">
               <span>Your user profile</span>
              
            </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Home;