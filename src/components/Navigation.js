import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Plus, Lightbulb, BarChart3, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/upload', label: 'Photo Upload', icon: <Camera size={20} /> },
    { path: '/manual-entry', label: 'Manual Entry', icon: <Plus size={20} /> },
    { path: '/recommendations', label: 'Recommendations', icon: <Lightbulb size={20} /> },
    { path: '/tracking', label: 'Tracking', icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🥗</span>
            <span className="logo-text">Diet Tracker</span>
          </Link>
          
          <div className="nav-right">
            <ul className="nav-links">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {user && (
              <div className="user-section">
                <div className="user-info">
                  <User size={16} />
                  <span className="user-name">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={16} />
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 