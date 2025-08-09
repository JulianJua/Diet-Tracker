import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Plus, Lightbulb, BarChart3 } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const features = [
    {
      title: 'Photo Upload',
      description: 'Take photos of your meals and let our app help you track your nutrition automatically.',
      icon: <Camera size={32} />,
      path: '/upload',
      color: '#007bff'
    },
    {
      title: 'Manual Entry',
      description: 'Manually input your food items and calories for precise tracking.',
      icon: <Plus size={32} />,
      path: '/manual-entry',
      color: '#28a745'
    },
    {
      title: 'Healthy Recommendations',
      description: 'Get personalized recommendations based on your eating patterns and goals.',
      icon: <Lightbulb size={32} />,
      path: '/recommendations',
      color: '#ffc107'
    },
    {
      title: 'Progress Tracking',
      description: 'View your eating patterns over time with detailed analytics and insights.',
      icon: <BarChart3 size={32} />,
      path: '/tracking',
      color: '#dc3545'
    }
  ];

  return (
    <div className="homepage">
      <div className="container">
        <div className="page-header">
          <h1>Welcome to Diet Tracker</h1>
          <p>
            Track your nutrition, monitor your progress, and get personalized recommendations 
            to help you achieve your health goals.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div 
                className="feature-icon"
                style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link to={feature.path} className="btn btn-primary">
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="quick-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Today's Calories</h3>
              <p className="stat-value">0</p>
              <p className="stat-label">calories consumed</p>
            </div>
            <div className="stat-card">
              <h3>Weekly Average</h3>
              <p className="stat-value">0</p>
              <p className="stat-label">calories per day</p>
            </div>
            <div className="stat-card">
              <h3>Streak</h3>
              <p className="stat-value">0</p>
              <p className="stat-label">days tracked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 