// Local storage utility functions for the diet tracker app

const STORAGE_KEYS = {
  FOOD_ITEMS: 'diet_tracker_food_items',
  PHOTOS: 'diet_tracker_photos',
  USER_PREFERENCES: 'diet_tracker_preferences',
  DAILY_GOALS: 'diet_tracker_goals'
};

export const saveFoodItems = (items) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error saving food items:', error);
    return false;
  }
};

export const getFoodItems = () => {
  try {
    const items = localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error loading food items:', error);
    return [];
  }
};

export const savePhoto = (photoData) => {
  try {
    const existingPhotos = getPhotos();
    const newPhoto = {
      id: Date.now(),
      data: photoData,
      date: new Date().toISOString(),
      calories: null // Will be populated when AI analysis is implemented
    };
    const updatedPhotos = [...existingPhotos, newPhoto];
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updatedPhotos));
    return true;
  } catch (error) {
    console.error('Error saving photo:', error);
    return false;
  }
};

export const getPhotos = () => {
  try {
    const photos = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    return photos ? JSON.parse(photos) : [];
  } catch (error) {
    console.error('Error loading photos:', error);
    return [];
  }
};

export const saveUserPreferences = (preferences) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

export const getUserPreferences = () => {
  try {
    const preferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return preferences ? JSON.parse(preferences) : {
      dailyCalorieGoal: 2000,
      weightGoal: 'maintain',
      activityLevel: 'moderate'
    };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {
      dailyCalorieGoal: 2000,
      weightGoal: 'maintain',
      activityLevel: 'moderate'
    };
  }
};

export const saveDailyGoals = (goals) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOALS, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving goals:', error);
    return false;
  }
};

export const getDailyGoals = () => {
  try {
    const goals = localStorage.getItem(STORAGE_KEYS.DAILY_GOALS);
    return goals ? JSON.parse(goals) : {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    };
  } catch (error) {
    console.error('Error loading goals:', error);
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    };
  }
};

export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}; 