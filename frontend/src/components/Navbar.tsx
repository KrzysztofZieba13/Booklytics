import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import API_URL from '../config';

function Navbar(): React.JSX.Element {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) setRole(null);
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`${API_URL}/api/users/by-clerk/${user.id}`)
      .then((res) => res.json())
      .then((data) => setRole(data.role ?? null))
      .catch(() => setRole(null));
  }, [isSignedIn, user]);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">🍃 Booklytics</Link>
      </div>
      <div className="nav-links">
        {role === 'admin' && <Link to="/admin">Panel Admina</Link>}
        {role === 'employee' && <Link to="/employee">Panel Pracownika</Link>}
        {role === 'client' && <Link to="/my-bookings">Moje wizyty</Link>}
      </div>
      <div className="nav-auth">
        <SignedOut>
          <Link to="/login" className="btn-nav-login">Zaloguj się</Link>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Navbar;
