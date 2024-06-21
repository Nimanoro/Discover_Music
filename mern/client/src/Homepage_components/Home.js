import React from "react";
import "./Home.css"
import { useState, useEffect } from "react";
import colorfulHeadphones from './images/colorfulheadphones.png';


const Home = () =>{

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const API_URL = process.env.REACT_APP_API_URI;


  useEffect(() => {
    // Check if user is logged in by making a request to the backend
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user`, {
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
    <section id="about" className="w-screen flex-row flex justify-center items-center  m-0 p-0">
      <div className="container mx-auto justify-center content-center  center-but flex px-10 py-20 flex-row items-center">
        <div className="w-100% h-90% content-center ">
          <div className= "wrapper items-center self-center justify-center">
            <div 
            className="text-center center-but mr-4px typing mb-4 font-medium dark:text-white pb:2vh">
            Hi there, I'm Discover Music!
            </div>
           <p className="mx-10 desc items-center text-center px-0 ">
           I am here to help you discover new music.
           I am a music recommendation system that will help you find new music based on your preferences and your mood.
          </p>
          <img className="size-[30rem] center" src={colorfulHeadphones} alt="music" />
          </div>
          {/* {isLoggedIn ? ( 
            <div className="flex md:px-40 justify-items-center align-center">
            <a
              href='/make_playlist'
              className="ml-4 inline-flex justify-center text-center btn-5 text-white  border-0 focus:outline-none hover:bg-green-600 rounded text-lg">
              <span>create a new playlist </span>
            </a>
            <a
              href="/User"
              className="text-center btn-5 justify-center inline-flex  border-0 focus:outline-none hover:bg-green-600 hover:text-white rounded text-lg">
               <span>Your user profile</span>
              
            </a>
            </div>
          ): (
            
          // <div className="flex md:px-40 justify-items-center align-center">
          //   <a
          //     href="/Login"
          //     className="ml-4 inline-flex justify-center text-center btn-5 text-white  border-0 focus:outline-none hover:bg-green-600 rounded text-lg">
          //     <span>Login with Spotify</span>
          //   </a>
          //   <a
          //     href="/User"
          //     className="text-center btn-5 justify-center inline-flex focus:outline-none hover:bg-green-600 hover:text-white rounded text-lg">
          //      <span>Your user profile</span>
              
          //   </a>
          //   </div>
          )} */}
        </div>
      </div>
    </section>
  );
}

export default Home;