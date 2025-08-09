import React, { useState } from 'react';
import { Lightbulb, Heart, Target, TrendingUp } from 'lucide-react';
import './Recommendations.css';

const Recommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');

  const recommendations = {
    general: [
      {
        title: 'Stay Hydrated',
        description: 'Drink at least 8 glasses of water per day to maintain good health and support metabolism.',
        icon: '💧',
        priority: 'high'
      },
      {
        title: 'Eat More Vegetables',
        description: 'Aim for at least 5 servings of vegetables daily to get essential vitamins and minerals.',
        icon: '🥬',
        priority: 'high'
      },
      {
        title: 'Include Protein',
        description: 'Include lean protein sources like chicken, fish, beans, and tofu in your meals.',
        icon: '🍗',
        priority: 'medium'
      },
      {
        title: 'Limit Processed Foods',
        description: 'Reduce consumption of processed foods high in added sugars and unhealthy fats.',
        icon: '🚫',
        priority: 'medium'
      }
    ],
    weightLoss: [
      {
        title: 'Calorie Deficit',
        description: 'Create a moderate calorie deficit of 500-750 calories per day for sustainable weight loss.',
        icon: '📉',
        priority: 'high'
      },
      {
        title: 'High Protein Diet',
        description: 'Increase protein intake to 1.2-1.6g per kg of body weight to preserve muscle mass.',
        icon: '🥩',
        priority: 'high'
      },
      {
        title: 'Regular Exercise',
        description: 'Combine cardio and strength training for optimal fat loss and muscle maintenance.',
        icon: '🏃‍♀️',
        priority: 'high'
      }
    ],
    muscleGain: [
      {
        title: 'Calorie Surplus',
        description: 'Consume 300-500 calories above maintenance to support muscle growth.',
        icon: '📈',
        priority: 'high'
      },
      {
        title: 'Protein Timing',
        description: 'Distribute protein intake evenly throughout the day, especially around workouts.',
        icon: '⏰',
        priority: 'high'
      },
      {
        title: 'Progressive Overload',
        description: 'Gradually increase resistance in strength training to stimulate muscle growth.',
        icon: '💪',
        priority: 'medium'
      }
    ],
    maintenance: [
      {
        title: 'Balanced Meals',
        description: 'Focus on balanced meals with protein, healthy fats, and complex carbohydrates.',
        icon: '⚖️',
        priority: 'high'
      },
      {
        title: 'Mindful Eating',
        description: 'Practice mindful eating by paying attention to hunger and fullness cues.',
        icon: '🧘‍♀️',
        priority: 'medium'
      },
      {
        title: 'Regular Check-ins',
        description: 'Monitor your progress weekly and adjust your plan as needed.',
        icon: '📊',
        priority: 'medium'
      }
    ]
  };

  const categories = [
    { id: 'general', label: 'General Health', icon: <Heart size={20} /> },
    { id: 'weightLoss', label: 'Weight Loss', icon: <TrendingUp size={20} /> },
    { id: 'muscleGain', label: 'Muscle Gain', icon: <Target size={20} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Lightbulb size={20} /> }
  ];

  return (
    <div className="recommendations">
      <div className="container">
        <div className="page-header">
          <h1>Healthy Recommendations</h1>
          <p>Get personalized recommendations based on your goals and eating patterns</p>
        </div>

        <div className="recommendations-section">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>

          <div className="recommendations-grid">
            {recommendations[selectedCategory].map((rec, index) => (
              <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-icon">{rec.icon}</span>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority}
                  </span>
                </div>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>
            ))}
          </div>

          <div className="tips-section">
            <h3>Daily Tips</h3>
            <div className="daily-tips">
              <div className="tip-card">
                <h4>Today's Focus</h4>
                <p>Try to include a serving of leafy greens in your next meal for extra nutrients.</p>
              </div>
              <div className="tip-card">
                <h4>Hydration Reminder</h4>
                <p>Don't forget to drink water throughout the day. Aim for 8 glasses minimum.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations; 