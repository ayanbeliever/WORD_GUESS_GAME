# Word Guess Game

A full-stack word guessing game similar to Wordle, built with React frontend and Flask backend, featuring user authentication, game logic, and admin dashboard.

## Features

### 🎮 Game Features
- **Daily Game Limit**: Each user can play maximum 3 games per day
- **Word Guessing**: 5 attempts to guess a 5-letter word
- **Color Feedback**: 
  - 🟢 Green: Correct letter in correct position
  - 🟡 Orange: Correct letter in wrong position  
  - ⚫ Grey: Letter not in the word
- **Smart Keyboard**: Virtual keyboard with color-coded feedback
- **Responsive Design**: Works on desktop and mobile devices

### 👤 User Management
- **Registration**: Username and password validation
- **Authentication**: JWT-based login system
- **User Types**: Regular players and admin users
- **Password Security**: bcrypt hashing

### 🔐 Admin Features
- **Daily Reports**: Statistics for any selected date
- **User Reports**: Detailed game history for specific users
- **Word Management**: Add new words to the game database
- **View All Words**: Browse the complete word list

## Tech Stack

### Backend
- **Flask**: Python web framework
- **MongoDB**: NoSQL database with pymongo
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Modern styling with gradients and animations

## Project Structure

```
word-guess-game/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py             # Configuration settings
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example         # Environment variables template
│   ├── models/
│   │   └── __init__.py      # Database models and connection
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── game.py          # Game logic routes
│   │   └── admin.py         # Admin routes
│   └── utils/
│       ├── __init__.py
│       └── validators.py    # Input validation utilities
├── frontend/
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── index.html          # HTML template
│   ├── public/
│   │   └── vite.svg        # Vite favicon
│   └── src/
│       ├── main.jsx        # React entry point
│       ├── App.jsx         # Main App component
│       ├── components/
│       │   ├── Auth/       # Login and Register components
│       │   ├── Game/       # Game board and keyboard
│       │   ├── Admin/      # Admin dashboard components
│       │   └── Common/     # Shared components
│       ├── services/
│       │   └── api.js      # API service layer
│       └── styles/
│           └── App.css     # Global styles
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud instance)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```env
   MONGO_URI=
   SECRET_KEY=
   JWT_SECRET=
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Run the Flask application**:
   ```bash
   python app.py
   ```

   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

### User Registration

1. **Username Requirements**:
   - At least 5 characters long
   - Must contain both uppercase AND lowercase letters
   - Examples: "JohnDoe", "Alice99"

2. **Password Requirements**:
   - At least 5 characters long
   - Must contain alphabetic characters
   - Must contain numeric characters
   - Must contain at least one special character: $, %, *, @
   - Examples: "Pass1$", "Test9@", "Word5%"

3. **User Types**:
   - Regular Player: Can play the game
   - Admin: Can access admin dashboard and manage words

### Playing the Game

1. **Start a Game**: Click "Start New Game" button
2. **Make Guesses**: Type 5-letter words or use the virtual keyboard
3. **Get Feedback**: Letters will be colored based on correctness
4. **Win/Lose**: Guess the word in 5 attempts or less
5. **Daily Limit**: Maximum 3 games per day per user

### Admin Features

1. **Daily Report**: View statistics for any date
   - Number of unique users
   - Total games played
   - Success rate
   - Correct guesses

2. **User Report**: Detailed analysis of any user
   - Total games and wins
   - Win rate percentage
   - Daily breakdown with game details

3. **Word Management**: 
   - Add new 5-letter words to the database
   - View all words currently in the game
   - Duplicate prevention

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Game (Protected)
- `POST /api/game/start` - Start new game
- `POST /api/game/guess` - Submit guess
- `GET /api/game/status` - Get daily game status

### Admin (Protected + Admin Only)
- `GET /api/admin/daily-report?date=YYYY-MM-DD` - Get daily report
- `GET /api/admin/user-report?username=USERNAME` - Get user report
- `POST /api/admin/add-word` - Add new word
- `GET /api/admin/words` - Get all words

## Game Logic

### Word Selection
- Random selection from database of 5-letter words
- All words are uppercase English words
- Initial database contains 20 words: APPLE, BREAD, CHAIR, etc.

### Feedback Algorithm
1. **First Pass**: Mark exact matches (green)
2. **Second Pass**: Mark wrong positions (orange) and not in word (grey)
3. **Duplicate Handling**: If word has one 'A' and guess has two 'A's, only mark one

### Daily Limits
- Each user can play maximum 3 games per day
- Games are tracked by date (UTC)
- Limit resets at midnight UTC

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: 24-hour token expiration
- **Input Validation**: Both frontend and backend validation
- **CORS Protection**: Configured for frontend origin only
- **Admin Authorization**: Admin-only routes protected

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "password": "string (hashed)",
  "is_admin": boolean,
  "created_at": datetime
}
```

### Games Collection
```json
{
  "_id": ObjectId,
  "username": "string",
  "target_word": "string",
  "guesses": [
    {
      "word": "string",
      "feedback": ["correct", "wrong_position", "not_in_word"],
      "timestamp": datetime
    }
  ],
  "won": boolean,
  "completed": boolean,
  "started_at": datetime,
  "completed_at": datetime
}
```

### Words Collection
```json
{
  "_id": ObjectId,
  "word": "string (unique, uppercase)"
}
```

## Development

### Running in Development Mode

1. **Backend**: 
   ```bash
   cd backend
   python app.py
   ```
   - Debug mode enabled
   - Auto-reload on file changes
   - Detailed error messages

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   - Hot reload enabled
   - Browser auto-refresh
   - Development tools

### Testing the Application

1. **Register Test Users**:
   - Regular user: "TestUser" / "Test1$"
   - Admin user: "AdminUser" / "Admin1$"

2. **Test Game Flow**:
   - Start game
   - Make guesses
   - Verify color feedback
   - Test win/lose conditions

3. **Test Admin Features**:
   - View daily reports
   - Check user reports
   - Add new words
   - View word list

## Deployment

### Backend Deployment
1. Set production environment variables
2. Use production WSGI server (Gunicorn)
3. Configure reverse proxy (Nginx)
4. Set up MongoDB Atlas or production MongoDB

### Frontend Deployment
1. Build production bundle: `npm run build` (creates `dist/` folder)
2. Preview production build: `npm run preview`
3. Serve static files with web server
4. Configure API endpoint for production backend

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Check if MongoDB is running
   - Verify connection string in .env file
   - Ensure database permissions

2. **CORS Errors**:
   - Verify frontend URL in Flask-CORS configuration
   - Check if backend is running on correct port

3. **JWT Token Errors**:
   - Check token expiration (24 hours)
   - Verify JWT_SECRET in environment variables
   - Clear localStorage and re-login

4. **Game Not Starting**:
   - Check daily game limit (3 games per day)
   - Verify user authentication
   - Check backend logs for errors

### Logs and Debugging

- **Backend Logs**: Check console output when running `python app.py`
- **Frontend Logs**: Use browser developer tools console
- **Network Issues**: Check Network tab in browser dev tools
- **Database Issues**: Check MongoDB logs and connection status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Verify all dependencies are installed correctly

---

**Enjoy playing the Word Guess Game!** 🎮✨
