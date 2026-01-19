import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Search, Send, User, LogOut, MessageSquare } from 'lucide-react';

// Mock initial data
const INITIAL_MESSAGES = [
  { id: 1, user: 'dev_sarah', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dev_sarah', content: 'Has anyone tried the new React compiler yet?', timestamp: '10:00 AM' },
  { id: 2, user: 'design_mike', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=design_mike', content: 'Yes! It is surprisingly fast. The setup was minimal.', timestamp: '10:05 AM' },
  { id: 3, user: 'algo_alice', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=algo_alice', content: 'I am still sticking to standard hooks for now. Need to see more stability.', timestamp: '10:12 AM' },
  { id: 4, user: 'sys_bob', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sys_bob', content: 'Anyone up for a game of chess later?', timestamp: '10:30 AM' },
];

const ChatPage = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      user: user.username,
      avatar: user.avatar,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  // Filter messages based on search query (content or username)
  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9f9f9' }}>

      {/* HEADER */}
      <header style={{
        padding: '1rem 2rem',
        borderBottom: '2px solid black',
        background: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'black', color: 'white', padding: '0.5rem', display: 'flex' }}>
            <MessageSquare size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '-0.5px' }}>Chatty</h1>
        </div>

        {/* SEARCH BAR */}
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              className="neo-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search messages or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* USER STATUS */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>@{user.username}</span>
              <button onClick={logout} className="neo-btn secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="neo-btn yellow" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <User size={16} /> Login
            </button>
          )}
        </div>
      </header>

      {/* MESSAGES AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>No messages found.</div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="neo-box" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <img src={msg.avatar} alt={msg.user} style={{ width: '50px', height: '50px', border: '2px solid black' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>@{msg.user}</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{msg.timestamp}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}>{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      <div style={{
        padding: '2rem',
        background: 'white',
        borderTop: '2px solid black',
      }}>
        <form onSubmit={handleSend} style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
          <input
            className="neo-input"
            placeholder={user ? "Type a message..." : "Login to send a message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="neo-btn" style={{ padding: '0 2rem' }}>
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
