const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
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

// Database: PostgreSQL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn('DATABASE_URL is not set. The app requires a PostgreSQL database (e.g., Neon/Supabase).');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl && /neon\.tech|render\.com|supabase\.co|amazonaws\.com/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined,
});

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS food_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      date DATE NOT NULL,
      calories INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('PostgreSQL migrations completed');
}
runMigrations().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});

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
      error:
        'Password must contain at least 8 characters, one uppercase letter, one special character, and one number',
    });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const inserted = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, name]
    );

    const userId = inserted.rows[0].id;
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User created successfully', token, user: { id: userId, email, name } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [
      req.user.userId,
    ]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Upload photo
app.post('/api/photos', authenticateToken, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { calories } = req.body;
  const filename = req.file.filename;
  const originalName = req.file.originalname;
  const date = new Date().toISOString().split('T')[0];

  try {
    const { rows } = await pool.query(
      'INSERT INTO photos (user_id, filename, original_name, date, calories) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.userId, filename, originalName, date, calories || null]
    );
    res.status(201).json({ message: 'Photo uploaded successfully', photo: { id: rows[0].id, filename, originalName, date, calories } });
  } catch (err) {
    res.status(500).json({ error: 'Error saving photo' });
  }
});

// Get user photos
app.get('/api/photos', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM photos WHERE user_id = $1 ORDER BY created_at DESC', [
      req.user.userId,
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete photo
app.delete('/api/photos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM photos WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    const photo = rows[0];
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const filePath = path.join(uploadsDir, photo.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    const del = await pool.query('DELETE FROM photos WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error('Delete photo error:', err);
    res.status(500).json({ error: 'Error deleting photo' });
  }
});

// Add food item
app.post('/api/food-items', authenticateToken, async (req, res) => {
  const { name, calories, mealType } = req.body;
  const date = new Date().toISOString().split('T')[0];

  if (!name || !calories || !mealType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO food_items (user_id, name, calories, meal_type, date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.userId, name, calories, mealType, date]
    );
    res.status(201).json({ message: 'Food item added successfully', foodItem: { id: rows[0].id, name, calories, mealType, date } });
  } catch (err) {
    res.status(500).json({ error: 'Error saving food item' });
  }
});

// Get user food items
app.get('/api/food-items', authenticateToken, async (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM food_items WHERE user_id = $1';
  const params = [req.user.userId];

  if (date) {
    query += ' AND date = $2';
    params.push(date);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete food item
app.delete('/api/food-items/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM food_items WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get photo by filename
app.get('/api/photos/:filename', async (req, res) => {
  const { filename } = req.params;
  const { token } = req.query;

  let userId;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } else {
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

  try {
    const { rows } = await pool.query('SELECT * FROM photos WHERE filename = $1 AND user_id = $2', [
      filename,
      userId,
    ]);
    const photo = rows[0];
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
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