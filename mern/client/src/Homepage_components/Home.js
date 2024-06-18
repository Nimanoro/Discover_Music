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
    <section id="about" className="w-screen flex justify-center items-center  m-0 p-0 overflow-x-hidden overflow-y-hidden">
      <div className="container mx-auto justify-center flex px-10 py-20 md:flex-row flex-col items-center">
        <div className="px-10 sm:px-20 py-10">
        </div>
        <div className="w-100% h-90% sm:w-50% sm:h-50% justify-end lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <div className= "wrapper">
            <div 
            className="text-center typing title-font md:text-4xl text-3xl mb-4 font-medium dark:text-white pb:2vh">
            Hi there, I'm Discover Music!
            </div>
           <p className="mx-10 desc text-center text-lg sm:text-md px-10 sm:px-0 ">
           I am here to help you discover new music.
           I am a music recommendation system that will help you find new music based on your preferences and your mood.
          </p>
          <img className="size-[30rem] justify-center" src={colorfulHeadphones} alt="music" />
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