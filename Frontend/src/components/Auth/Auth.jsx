import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSwitchToLogin = (email = '', msg = '') => {
    setPrefilledEmail(email);
    setMessage(msg);
    setView('login');
  };

  const handleSwitchToSignup = () => {
    setMessage('');
    setView('signup');
  };

  return (
    <div className="auth-container">
      {view === 'login' ? (
        <Login 
          onSwitchToSignup={handleSwitchToSignup} 
          onLoginSuccess={onLoginSuccess}
          defaultEmail={prefilledEmail}
          message={message}
        />
      ) : (
        <Signup 
          onSwitchToLogin={handleSwitchToLogin} 
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
};

export default Auth;
