import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, useUser } from '@clerk/clerk-react';
import API_URL from '../config';

function Login(): React.JSX.Element {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    fetch(`${API_URL}/api/users/by-clerk/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/my-bookings', { replace: true });
        }
      })
      .catch(() => navigate('/my-bookings', { replace: true }));
  }, [isLoaded, isSignedIn, user, navigate]);

  if (isSignedIn) return <></>;

  return (
    <div className="login-page">
      <SignIn routing="hash" />
    </div>
  );
}

export default Login;
