import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getUser } from './services/api.jsx';

// Components
import Navbar from './components/Common/Navbar.jsx';
import ProtectedRoute from './components/Common/ProtectedRoute.jsx';
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register.jsx';
import GameBoard from './components/Game/GameBoard.jsx';
import Dashboard from './components/Admin/Dashboard.jsx';

// Styles
import './styles/App.css';

function Home() {
  const [user, setUser] = useState(getUser());
  useEffect(() => {
    const onAuthChanged = () => setUser(getUser());
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  return (
    <div className="home-landing">
      <section className="hero hero-centered">
        <h1 className="hero-title">Word Guess Game</h1>
        <p className="hero-subtitle">Test your vocabulary and logic in a fun 5-letter word challenge.</p>
        <div className="hero-actions">
          {user ? (
            <a href="/game" className="btn btn-success btn-large">Start Game</a>
          ) : (
            <a href="/login" className="btn btn-primary btn-large">Start Game</a>
          )}
        </div>
      </section>
      <section className="features features-vertical">
        <div className="feature-card">
          <h3>Daily Limit</h3>
          <p>Play up to 3 games per day. Make every guess count!</p>
        </div>
        <div className="feature-card">
          <h3>Smart Feedback</h3>
          <p>Green, Orange, Grey indicators guide you to the right word.</p>
        </div>
        <div className="feature-card">
          <h3>Compete & Improve</h3>
          <p>Track your wins and analyze progress with detailed stats.</p>
        </div>
      </section>
      <section className="about">
        <h2>About the Game</h2>
        <p>
          Each game selects a random 5-letter word. You have 5 attempts. Exact letter and
          position matches appear green, letters present in a different position are orange, and
          letters not in the word are grey. Duplicates are handled carefully.
        </p>
      </section>
      <footer className="copyright-footer">© {new Date().getFullYear()} Word Guess Game</footer>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const onAuthChanged = () => setUser(getUser());
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.is_admin ? '/admin' : '/game'} replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to={user.is_admin ? '/admin' : '/game'} replace /> : <Register />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <GameBoard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Default route */}
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
