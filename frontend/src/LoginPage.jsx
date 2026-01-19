import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      login(username);
      navigate('/');
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(45deg, #fff, #fff 10px, #f4f4f4 10px, #f4f4f4 20px)'
    }}>
      <div className="neo-box" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}>
        <h1 style={{ marginTop: 0, fontSize: '2.5rem', borderBottom: '4px solid black', paddingBottom: '1rem' }}>
          Join the Chat
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
          Enter your username to start messaging. No password required for this demo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold' }}>USERNAME</label>
          <input
            className="neo-input"
            type="text"
            placeholder="e.g. pixel_wizard"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <button type="submit" className="neo-btn">
            START TALKING <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
