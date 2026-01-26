import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Search, Send, User, LogOut, MessageSquare, Shield, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const rawApiUrl = import.meta.env.VITE_API_URL;
  const isLocalApi = rawApiUrl?.includes('localhost');
  const API_URL =
    rawApiUrl && (!isLocalApi || window.location.hostname === 'localhost')
      ? rawApiUrl
      : (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api');
  const WS_PATH = import.meta.env.VITE_WS_PATH || '/api/socket.io';

  const scrollToBottom = (behavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom('auto');
    }
  }, [messages]);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      const url = `${API_URL}/messages${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load messages');
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setMessagesError(err.message);
    } finally {
      setMessagesLoading(false);
    }
  }, [API_URL, searchQuery]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`${API_URL}/users`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchMessages();
    }, 300);
    return () => clearTimeout(handle);
  }, [fetchMessages]);

  useEffect(() => {
    if (adminOpen && user?.role === 'admin') {
      fetchUsers();
    }
  }, [adminOpen, user?.role, fetchUsers]);

  useEffect(() => {
    const socketUrl = API_URL.startsWith('http')
      ? (API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL)
      : undefined;
    const socket = socketUrl
      ? io(socketUrl, { withCredentials: true, path: WS_PATH })
      : io({ withCredentials: true, path: WS_PATH });
    socket.on('message:new', (message) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });
    return () => {
      socket.off('message:new');
      socket.disconnect();
    };
  }, [API_URL, WS_PATH]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      shouldAutoScrollRef.current = true;
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: inputValue }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      const created = await res.json();
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === created.id)) {
          return prev;
        }
        return [...prev, created];
      });
      setInputValue('');
    } catch (err) {
      setMessagesError(err.message);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to delete message');
      }
      await fetchMessages();
    } catch (err) {
      setMessagesError(err.message);
    }
  };

  const handleToggleBan = async (targetUser) => {
    try {
      const res = await fetch(`${API_URL}/users/${targetUser.id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ banned: !targetUser.banned }),
      });
      if (!res.ok) {
        throw new Error('Failed to update user');
      }
      await fetchUsers();
    } catch (err) {
      setUsersError(err.message);
    }
  };

  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 80;
  };

  const filteredMessages = (userFilter.trim()
    ? messages.filter((msg) =>
        msg.user?.username?.toLowerCase().includes(userFilter.trim().toLowerCase()),
      )
    : messages
  ).slice().sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  });

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
        <div style={{ flex: 1, maxWidth: '680px', margin: '0 0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              className="neo-input"
              style={{ paddingLeft: '40px' }}
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <input
              className="neo-input"
              placeholder="Filter by user..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
        </div>

        {/* USER STATUS */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>@{user.username}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => setAdminOpen((prev) => !prev)}
                  className="neo-btn secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  <Shield size={16} /> Admin
                </button>
              )}
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

      {/* ADMIN PANEL */}
      {adminOpen && user?.role === 'admin' && (
        <div style={{ padding: '2rem', paddingBottom: 0 }}>
          <div className="neo-box" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginTop: 0, borderBottom: '3px solid black', paddingBottom: '0.5rem' }}>Admin Panel</h2>
            {usersError && (
              <div style={{ backgroundColor: '#ffaaaa', padding: '0.75rem', border: '2px solid black', marginBottom: '1rem', fontWeight: 'bold' }}>
                {usersError}
              </div>
            )}
            {usersLoading ? (
              <div>Loading users...</div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {users.map((u) => (
                  <div key={u.id} className="neo-box" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img src={u.avatar} alt={u.username} style={{ width: '40px', height: '40px', border: '2px solid black' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>@{u.username}</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{u.role.toUpperCase()}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: u.banned ? '#b00020' : '#0a7f42' }}>
                      {u.banned ? 'BANNED' : 'ACTIVE'}
                    </div>
                    <button
                      className="neo-btn secondary"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      onClick={() => handleToggleBan(u)}
                    >
                      {u.banned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messagesError && (
            <div style={{ backgroundColor: '#ffaaaa', padding: '0.75rem', border: '2px solid black', fontWeight: 'bold' }}>
              {messagesError}
            </div>
          )}
          {messagesLoading ? (
            <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '2rem' }}>Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>No messages found.</div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="neo-box" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                <img src={msg.user?.avatar} alt={msg.user?.username} style={{ width: '50px', height: '50px', border: '2px solid black' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>@{msg.user?.username}</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  {/* VULNERABLE: XSS Stored - renders HTML without sanitization */}
                  <p
                    style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5' }}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                  {user?.role === 'admin' && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        className="neo-btn secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
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
