import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
    <div>
      <nav className="navbar background h-100% w-100% overflow-x-hidden">
        <ul className="nav-list sm:w-full">
          <li><a href="/">Home</a></li>
          {isLoggedIn ? (
            <>
              <li><a href="my_profile">My Profile</a></li>
              <li><a href="make_playlist">New playlist</a></li>

              <li><a href="#" onClick={() => {
                // Log out the user
                fetch('http://localhost:2800/api/logout', {
                  method: 'POST',
                  credentials: 'include'
                }).then(() => {
                  setIsLoggedIn(false);
                  window.location.href = '/login';
                });
              }}>Logout</a></li>
            </>
          ) : (
            <li><a href="login">Login</a></li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
