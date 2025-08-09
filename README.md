# Diet Tracker App

A modern React-based diet tracking application with user authentication, database storage, and personalized health recommendations.

## Features

- 🔐 **User Authentication**: Secure registration and login with password validation
- 📸 **Photo Upload**: Take photos of meals for automatic nutrition tracking
- ✏️ **Manual Entry**: Manually input food items and calories
- 💡 **Health Recommendations**: Get personalized recommendations based on goals
- 📊 **Progress Tracking**: Monitor eating patterns over time with analytics
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 💾 **Database Storage**: SQLite database for data persistence
- 🔒 **Secure**: JWT-based authentication and user-specific data

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if it doesn't exist)
   - Update the `JWT_SECRET` in the `.env` file

4. Start the development server (both frontend and backend):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Alternative Startup Methods

**Quick Start (Mac/Linux)**:
```bash
chmod +x start-fullstack.sh
./start-fullstack.sh
```

**Quick Start (Windows)**:
```cmd
start.bat
```

**Manual Start**:
```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm start
```

## Project Structure

```
diet-tracker/
├── server/
│   ├── index.js                 # Express server with API routes
│   └── database.sqlite          # SQLite database (auto-generated)
├── uploads/                     # Photo uploads directory (auto-generated)
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navigation.js        # Navigation with auth features
│   │   ├── Navigation.css
│   │   └── ProtectedRoute.js    # Route protection component
│   ├── context/
│   │   └── AuthContext.js       # Authentication context
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── PhotoUpload.js       # Updated with backend integration
│   │   ├── ManualEntry.js       # Updated with backend integration
│   │   ├── Recommendations.js
│   │   ├── Tracking.js
│   │   ├── Login.js             # New authentication page
│   │   ├── Register.js          # New registration page
│   │   └── Auth.css             # Authentication styles
│   ├── utils/
│   │   └── localStorage.js      # Local storage utilities
│   ├── App.js                   # Updated with auth routes
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json                 # Updated with backend dependencies
├── .env                         # Environment variables
└── README.md
```

## Authentication System

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one special character
- At least one number

### User Features
- Secure registration and login
- JWT-based authentication
- User-specific data isolation
- Automatic session management

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Food Items
- `GET /api/food-items` - Get user's food items
- `POST /api/food-items` - Add new food item
- `DELETE /api/food-items/:id` - Delete food item

### Photos
- `GET /api/photos` - Get user's photos
- `POST /api/photos` - Upload photo
- `GET /api/photos/:filename` - Get photo by filename
- `DELETE /api/photos/:id` - Delete photo

## Database Schema

### Users Table
- `id` (INTEGER PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `password` (TEXT - hashed)
- `name` (TEXT)
- `created_at` (DATETIME)

### Food Items Table
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER - foreign key)
- `name` (TEXT)
- `calories` (INTEGER)
- `meal_type` (TEXT)
- `date` (TEXT)
- `created_at` (DATETIME)

### Photos Table
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER - foreign key)
- `filename` (TEXT)
- `original_name` (TEXT)
- `date` (TEXT)
- `calories` (INTEGER)
- `created_at` (DATETIME)

## Technologies Used

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing with protected routes
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with flexbox and grid

### Backend
- **Express.js**: Node.js web framework
- **SQLite3**: Lightweight database
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- User-specific data isolation
- Input validation and sanitization
- Secure file upload handling
- CORS configuration

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Social login integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Social features and sharing
- [ ] Barcode scanning for packaged foods
- [ ] Integration with fitness trackers
- [ ] Meal planning and recipes
- [ ] AI-powered nutrition analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 