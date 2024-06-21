import React, { useEffect, useState } from 'react';
import './Navbar.css';
import loginWithSpotify from '../Login/login_func';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('color-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const uri = loginWithSpotify();
  const API_URL = process.env.REACT_APP_API_URI;

  const getid = () => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        credentials: 'include' // Ensure cookies are included in the request
      });
      if (response.ok) {
        response.json().
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };


  }
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.getElementById('theme-toggle-light-icon').classList.remove('hidden');
      document.getElementById('theme-toggle-dark-icon').classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      document.getElementById('theme-toggle-dark-icon').classList.remove('hidden');
      document.getElementById('theme-toggle-light-icon').classList.add('hidden');
    }

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
  }, [theme]);

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
      localStorage.setItem('color-theme', 'dark');
    } else {
      setTheme('light');
      localStorage.setItem('color-theme', 'light');
    }
  };

  return (
    <div className='navbar-container justify-center items-center flex'>
      <ul className='menu-bar justify-center items-center flex'>
        <li><a href="/">Home</a></li>
        {isLoggedIn ? (
          <>
            <li><a href="my_profile">My Profile</a></li>
            <li><a href="make_playlist">New Playlist</a></li>
            <li><a 
              href="/"
              onClick={() => {
                fetch(`${API_URL}/api/logout`, {
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
        <li>
          <button
            id="theme-toggle"
            type="button"
            onClick={handleThemeToggle}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm "
          >
            <svg
              id="theme-toggle-dark-icon"
              className="hidden w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg
              id="theme-toggle-light-icon"
              className="hidden w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
