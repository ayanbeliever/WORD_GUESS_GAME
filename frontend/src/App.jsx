import React from 'react';
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

function App() {
  const user = getUser();

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        
        <main className="main-content">
          <Routes>
            {/* Public routes */}
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
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to={user.is_admin ? '/admin' : '/game'} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
