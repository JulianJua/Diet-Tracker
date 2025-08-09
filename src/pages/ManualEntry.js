import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import axios from 'axios';
import './ManualEntry.css';

const ManualEntry = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    calories: '',
    mealType: 'breakfast'
  });
  const [loading, setLoading] = useState(true);

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  // Load food items from API on component mount
  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`/api/food-items?date=${today}`);
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error loading food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.calories) {
      try {
        const response = await axios.post('/api/food-items', {
          name: newItem.name,
          calories: parseInt(newItem.calories),
          mealType: newItem.mealType
        });

        setFoodItems(prev => [response.data.foodItem, ...prev]);
        setNewItem({
          name: '',
          calories: '',
          mealType: 'breakfast'
        });
      } catch (error) {
        alert(error.response?.data?.error || 'Error adding food item');
      }
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await axios.delete(`/api/food-items/${id}`);
      setFoodItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert(error.response?.data?.error || 'Error removing food item');
    }
  };

  const totalCalories = foodItems.reduce((sum, item) => sum + parseInt(item.calories || 0), 0);

  return (
    <div className="manual-entry">
      <div className="container">
        <div className="page-header">
          <h1>Manual Entry</h1>
          <p>Manually input your food items and calories for precise tracking</p>
        </div>

        <div className="entry-section">
          <div className="entry-form card">
            <h3>Add Food Item</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Food Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Grilled Chicken Breast"
                />
              </div>
              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  value={newItem.calories}
                  onChange={handleInputChange}
                  placeholder="250"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mealType">Meal Type</label>
                <select
                  id="mealType"
                  name="mealType"
                  value={newItem.mealType}
                  onChange={handleInputChange}
                >
                  {mealTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button onClick={handleAddItem} className="btn btn-primary">
              <Plus size={16} />
              Add Item
            </button>
          </div>

          <div className="food-list card">
            <div className="list-header">
              <h3>Today's Food Items</h3>
              <div className="total-calories">
                Total: <span className="calorie-count">{totalCalories}</span> calories
              </div>
            </div>
            
            {loading ? (
              <div className="loading-message">Loading food items...</div>
            ) : foodItems.length === 0 ? (
              <div className="empty-state">
                <p>No food items added yet. Start by adding your first meal!</p>
              </div>
            ) : (
              <div className="food-items">
                {foodItems.map(item => (
                  <div key={item.id} className="food-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <span className="meal-type">{item.meal_type}</span>
                    </div>
                    <div className="item-calories">
                      {item.calories} calories
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-item-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEntry; 