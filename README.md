# JaMoveo

A real-time collaborative music rehearsal application for Moveo's jam sessions.

## Project Overview

JaMoveo is a web application designed to enhance music rehearsals by allowing musicians to view synchronized song lyrics and chords from their mobile devices. The application enables an admin user to search for songs and display them to all connected musicians, with content tailored to each musician's instrument.

### Key Features

- **User Authentication**: Register with your instrument type and log in securely
- **Role-based Content**: Singers see lyrics, instrumentalists see chords and lyrics
- **Real-time Synchronization**: Admin controls what everyone sees simultaneously
- **Auto-scroll Functionality**: Hands-free scrolling for active playing
- **Mobile-Optimized Interface**: Designed for use on phones in rehearsal settings
- **High-Contrast Display**: Readable interface even in smoky rehearsal rooms
- **Multi-language Support**: Song search and display in both English and Hebrew

## Tech Stack

- **Frontend**: React.js, Socket.io client, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/jamoveo.git
cd jamoveo
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit the .env file with your configuration
# - Set a secure JWT_SECRET
# - Configure MongoDB connection
# - Set ADMIN_SIGNUP_CODE for admin registration

# Start the server in development mode
npm run dev
```

### 4. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Start the client in development mode
npm start
```

### 5. Seed Initial Data

To populate the database with sample song data and create default users:

```bash
# From the server directory
npm run seed
```

This will create:
- A default admin user (username: admin, password: adminpassword)
- A default regular user (username: user, password: password)
- Sample songs in both English and Hebrew

## Usage

### User Types

#### Regular Musician
- Register with your instrument
- Log in and wait for the admin to select a song
- View lyrics and/or chords according to your instrument
- Use auto-scroll for hands-free playing

#### Admin User
- Register using the special admin URL (http://localhost:3000/admin-signup)
- Enter the admin code from your .env file (ADMIN_SIGNUP_CODE)
- Log in to access the admin dashboard
- Search for songs in English or Hebrew
- Select songs to display to all connected musicians
- Control the rehearsal session

### Creating User Accounts

#### Regular User Registration
1. Visit `http://localhost:3000/signup`
2. Enter a username and password
3. Select your instrument from the dropdown
4. Click "Create Account"

#### Admin Registration
1. Visit `http://localhost:3000/admin-signup` 
2. Enter a username, password and the admin code (from .env file)
3. Click "Create Admin Account"

## 🎵 Features In Depth

### Auto-Scroll Functionality
- Tap the "Auto-Scroll" button to enable hands-free scrolling
- Adjust speed with the + and - buttons
- Admin can control scrolling for all connected users simultaneously

### High-Contrast Mode
- Toggle high-contrast mode for better visibility in smoky environments
- Increases font size and enhances color contrast

### Role-Based Content Display
- Vocalists see only lyrics
- Instrumentalists see both chords and lyrics
- Admin sees the full interface with control buttons

### Multi-language Support
- Support for both English and Hebrew content
- Proper right-to-left (RTL) display for Hebrew songs

## Development

### Project Structure

```
jamoveo/
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   └── src/                 # React source code
│       ├── components/      # Reusable components
│       ├── context/         # React context providers
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       ├── services/        # API services
│       └── utils/           # Utility functions
│
├── server/                  # Backend Node.js application
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── data/                # Sample data
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── socket/              # Socket.io implementation
│   └── utils/               # Utility functions
└── package.json             # Root package.json for development tools
```

### Backend API Overview

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/admin-register` - Register an admin user
- `POST /api/auth/login` - Log in a user
- `POST /api/auth/logout` - Log out current user

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Songs
- `GET /api/songs` - Search songs with query parameters
- `GET /api/songs/:id` - Get a specific song

#### Sessions
- `POST /api/sessions` - Create a new session (admin only)
- `GET /api/sessions/active` - Get active sessions
- `POST /api/sessions/:id/join` - Join a session
- `POST /api/sessions/:id/set-song/:songId` - Set active song (admin only)
- `POST /api/sessions/:id/clear-song` - Clear active song (admin only)

### Socket.io Events

#### Client-to-Server Events
- `join_session` - Join a rehearsal session
- `leave_session` - Leave the current session
- `select_song` - Select a song to display (admin only)
- `quit_song` - End the current song display (admin only)
- `toggle_autoscroll` - Toggle auto-scroll feature
- `scroll_position` - Update scroll position

#### Server-to-Client Events
- `session_state` - Session state update
- `user_joined` - User joined notification
- `user_left` - User left notification
- `song_selected` - Song selected notification
- `song_quit` - Song ended notification
- `autoscroll_state` - Auto-scroll state update

## Deployment

The application can be deployed as follows:

### Backend Deployment
1. Set environment variables in production
2. Build and deploy the Node.js server
3. Ensure MongoDB is accessible

### Frontend Deployment
1. Build the React application
2. Deploy the built files to a static hosting service
