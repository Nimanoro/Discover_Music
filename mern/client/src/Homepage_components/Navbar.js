import React, { useEffect, useState } from 'react';
import './Navbar.css';
import loginWithSpotify from '../Login/login_func';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const uri = loginWithSpotify();

  useEffect(() => {
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
    <div className='navbar-container justify-center items-center flex'>
      <ul className='menu-bar'>
        <li><a href="/">Home</a></li>
        {isLoggedIn ? (
          <>
            <li><a href="my_profile">My Profile</a></li>
            <li><a href="make_playlist">New Playlist</a></li>
            <li><a 
              href="/"
              onClick={() => {
                fetch('http://localhost:2800/api/logout', {
                  method: 'POST',
                  credentials: 'include'
                }).then(() => {
                  setIsLoggedIn(false);
                  window.location.href = '/';
                });
              }}
            >Logout</a></li>
          </>
        ) : (
          <li><a href={uri}>Login</a></li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
