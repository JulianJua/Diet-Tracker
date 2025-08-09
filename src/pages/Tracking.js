import React, { useState } from 'react';
import { BarChart3, Calendar, TrendingUp, Target } from 'lucide-react';
import './Tracking.css';

const Tracking = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data - in a real app, this would come from local storage or API
  const mockData = {
    week: [
      { day: 'Mon', calories: 1850, target: 2000 },
      { day: 'Tue', calories: 2100, target: 2000 },
      { day: 'Wed', calories: 1750, target: 2000 },
      { day: 'Thu', calories: 1950, target: 2000 },
      { day: 'Fri', calories: 2200, target: 2000 },
      { day: 'Sat', calories: 1800, target: 2000 },
      { day: 'Sun', calories: 1600, target: 2000 }
    ],
    month: [
      { week: 'Week 1', calories: 13500, target: 14000 },
      { week: 'Week 2', calories: 14200, target: 14000 },
      { week: 'Week 3', calories: 13800, target: 14000 },
      { week: 'Week 4', calories: 14500, target: 14000 }
    ]
  };

  const periods = [
    { id: 'week', label: 'This Week', icon: <Calendar size={16} /> },
    { id: 'month', label: 'This Month', icon: <TrendingUp size={16} /> }
  ];

  const calculateStats = () => {
    const data = mockData[selectedPeriod];
    const totalCalories = data.reduce((sum, item) => sum + item.calories, 0);
    const averageCalories = Math.round(totalCalories / data.length);
    const targetCalories = data[0]?.target || 2000;
    const percentage = Math.round((averageCalories / targetCalories) * 100);

    return {
      total: totalCalories,
      average: averageCalories,
      percentage,
      target: targetCalories
    };
  };

  const stats = calculateStats();

  return (
    <div className="tracking">
      <div className="container">
        <div className="page-header">
          <h1>Progress Tracking</h1>
          <p>Monitor your eating patterns and progress over time</p>
        </div>

        <div className="tracking-section">
          <div className="period-selector">
            {periods.map(period => (
              <button
                key={period.id}
                className={`period-tab ${selectedPeriod === period.id ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.icon}
                {period.label}
              </button>
            ))}
          </div>

          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <h3>Average Daily Calories</h3>
                <p className="stat-value">{stats.average}</p>
                <p className="stat-label">out of {stats.target} target</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <h3>Goal Achievement</h3>
                <p className="stat-value">{stats.percentage}%</p>
                <p className="stat-label">of daily target</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Calories</h3>
                <p className="stat-value">{stats.total.toLocaleString()}</p>
                <p className="stat-label">this {selectedPeriod}</p>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-card">
              <h3>Calorie Intake Over Time</h3>
              <div className="chart-container">
                {mockData[selectedPeriod].map((item, index) => (
                  <div key={index} className="chart-bar">
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${(item.calories / item.target) * 100}%`,
                          backgroundColor: item.calories > item.target ? '#dc3545' : '#28a745'
                        }}
                      ></div>
                    </div>
                    <span className="bar-label">{item.day || item.week}</span>
                    <span className="bar-value">{item.calories}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="insights-section">
            <h3>Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Trend Analysis</h4>
                <p>
                  {stats.average > stats.target 
                    ? `You're averaging ${stats.average - stats.target} calories above your daily target. Consider reducing portion sizes or choosing lower-calorie alternatives.`
                    : `You're averaging ${stats.target - stats.average} calories below your daily target. Make sure you're eating enough to meet your nutritional needs.`
                  }
                </p>
              </div>
              <div className="insight-card">
                <h4>Recommendations</h4>
                <ul>
                  <li>Track your meals consistently for better insights</li>
                  <li>Consider meal planning to stay on target</li>
                  <li>Include a variety of nutrient-dense foods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking; 