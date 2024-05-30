import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <div>
    <nav class="navbar background h-100% w-100%  overflow-x-hidden ">
        <ul class="nav-list sm:w-full ">
            
            <li><a href="/">Home</a></li>
            <li><a href="database">Database</a></li>
            <li><a href="login">Login</a></li>
        </ul>
      </nav>
      </div>

  );
};
  
export default Navbar;