import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      if (isRegister) {
        await register(username, password);
        await login(username, password);
      } else {
        await login(username, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
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
          {isRegister ? 'Join the Chat' : 'Welcome Back'}
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
          {isRegister 
            ? 'Create an account to start messaging.' 
            : 'Enter your credentials to continue.'}
        </p>

        {error && (
          <div style={{ 
            backgroundColor: '#ffaaaa', 
            padding: '0.75rem', 
            border: '2px solid black', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>USERNAME</label>
            <input
              className="neo-input"
              type="text"
              placeholder="e.g. pixel_wizard"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>PASSWORD</label>
            <input
              className="neo-input"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="neo-btn">
            {isRegister ? 'REGISTER & LOGIN' : 'LOGIN'} <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              textDecoration: 'underline', 
              cursor: 'pointer', 
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
