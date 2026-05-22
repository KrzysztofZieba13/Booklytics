import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function Navbar(): React.JSX.Element {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">🍃 Booklytics</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Szukaj usług</Link>
        <Link to="/admin">Panel Biznesu</Link>
      </div>
      <div className="nav-auth">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-nav-login">Zaloguj się</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;