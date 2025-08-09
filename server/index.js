const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Resolve storage locations (configurable via env for production/persistent disks)
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

// Serve uploads directory as static
app.use(express.static(uploadsDir));

// Database setup
const databaseFilePath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(databaseFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Food items table
    db.run(`CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Photos table
    db.run(`CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      date TEXT NOT NULL,
      calories INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  });
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Password validation
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUpperCase && hasSpecialChar && hasNumber && isLongEnough;
}

// Routes

// Register user
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ 
      error: 'Password must contain at least 8 characters, one uppercase letter, one special character, and one number' 
    });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', 
        [email, hashedPassword, name], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
          message: 'User created successfully',
          token,
          user: { id: this.lastID, email, name }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Upload photo
app.post('/api/photos', authenticateToken, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { calories } = req.body;
  const filename = req.file.filename;
  const originalName = req.file.originalname;
  const date = new Date().toISOString().split('T')[0];

  db.run('INSERT INTO photos (user_id, filename, original_name, date, calories) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, filename, originalName, date, calories || null], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error saving photo' });
    }
    res.status(201).json({ 
      message: 'Photo uploaded successfully',
      photo: { id: this.lastID, filename, originalName, date, calories }
    });
  });
});

// Get user photos
app.get('/api/photos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId], (err, photos) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(photos);
  });
});

// Delete photo
app.delete('/api/photos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  console.log('Delete photo request:', { id, userId: req.user.userId });

  db.get('SELECT * FROM photos WHERE id = ? AND user_id = ?', [id, req.user.userId], (err, photo) => {
    if (err) {
      console.error('Database error in delete photo:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!photo) {
      console.log('Photo not found:', { id, userId: req.user.userId });
      return res.status(404).json({ error: 'Photo not found' });
    }

    console.log('Photo found:', photo);

    // Delete the file from the filesystem
    const filePath = path.join(uploadsDir, photo.filename);
    console.log('Attempting to delete file:', filePath);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('File deleted successfully:', filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    } else {
      console.log('File not found:', filePath);
    }

    // Delete from database
    db.run('DELETE FROM photos WHERE id = ? AND user_id = ?', [id, req.user.userId], function(err) {
      if (err) {
        console.error('Error deleting from database:', err);
        return res.status(500).json({ error: 'Error deleting photo' });
      }
      console.log('Photo deleted from database:', { id, changes: this.changes });
      res.json({ message: 'Photo deleted successfully' });
    });
  });
});

// Add food item
app.post('/api/food-items', authenticateToken, (req, res) => {
  const { name, calories, mealType } = req.body;
  const date = new Date().toISOString().split('T')[0];

  if (!name || !calories || !mealType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run('INSERT INTO food_items (user_id, name, calories, meal_type, date) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, name, calories, mealType, date], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error saving food item' });
    }
    res.status(201).json({ 
      message: 'Food item added successfully',
      foodItem: { id: this.lastID, name, calories, mealType, date }
    });
  });
});

// Get user food items
app.get('/api/food-items', authenticateToken, (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM food_items WHERE user_id = ?';
  let params = [req.user.userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, foodItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(foodItems);
  });
});

// Delete food item
app.delete('/api/food-items/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM food_items WHERE id = ? AND user_id = ?', [id, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  });
});

// Get photo by filename
app.get('/api/photos/:filename', (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;

  // Check if token is provided in query params (for image src)
  let userId;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } else {
    // Check Authorization header (for API calls)
    const authHeader = req.headers['authorization'];
    const authToken = authHeader && authHeader.split(' ')[1];
    
    if (!authToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(authToken, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }

  db.get('SELECT * FROM photos WHERE filename = ? AND user_id = ?', [filename, userId], (err, photo) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filePath);
  });
});

// Serve React build (if present) for non-API routes in production
const clientBuildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get(/^(?!\/api\/).+/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 