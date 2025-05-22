# JaMoveo

A real-time collaborative music rehearsal application that synchronizes song lyrics and chords across band members' devices.

## Overview

JaMoveo transforms traditional band rehearsals by providing a synchronized digital platform where musicians can view song lyrics and chords on their mobile devices. An admin controls what everyone sees in real-time, eliminating the need for paper sheets and ensuring everyone is literally on the same page.

## Features

### For Musicians
- **Instrument-Based Registration**: Sign up with your specific instrument (guitar, bass, drums, vocals, keyboard, saxophone, or other)
- **Role-Based Content**: Vocalists see only lyrics, while instrumentalists see both lyrics and chords
- **Auto-Scroll**: Hands-free scrolling with adjustable speed for uninterrupted playing
- **High Contrast Mode**: Enhanced visibility in smoky rehearsal environments
- **Mobile-Optimized**: Large fonts and touch-friendly interface designed for phones

### For Admins
- **Song Search**: Search through the song database in English or Hebrew
- **Real-Time Control**: Select songs that instantly appear on all connected devices
- **Session Management**: Create and control rehearsal sessions
- **Quit Functionality**: End songs and return all users to the waiting screen

### Technical Features
- **Real-Time Synchronization**: Socket.io ensures zero-latency updates
- **Bilingual Support**: Proper RTL layout for Hebrew songs
- **JWT Authentication**: Secure user sessions with role-based access
- **Responsive Design**: Works seamlessly on all device sizes
- **Connection Status**: Visual indicators for connection issues

## Tech Stack

### Frontend
- **React.js** (v19.1.0) - UI framework
- **Tailwind CSS** - Styling with custom Apple-inspired design
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** with **Express** (v5.1.0) - Server framework
- **Socket.io** - WebSocket implementation
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Deployment
- **Railway** - Production hosting platform
- **GitHub** - Version control

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/itayost/JaMoveo.git
   cd JaMoveo
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/jamoveo

   # JWT Configuration
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d

   # Admin Registration Code
   ADMIN_SIGNUP_CODE=your-admin-code

   # Server Port
   PORT=5001

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the Database**
   ```bash
   cd server
   npm run seed
   ```
   This creates sample songs and default users.

5. **Start Development Servers**
   ```bash
   # From project root
   npm run dev
   ```
   This starts both frontend (port 3000) and backend (port 5001).

## Usage Guide

### Creating Accounts

#### Regular Musician
1. Navigate to `http://localhost:3000/signup`
2. Enter username, password, and select your instrument
3. Click "Sign Up"

#### Admin User
1. Navigate to `http://localhost:3000/admin-signup`
2. Enter username, password, and the admin code from `.env`
3. Click "Create Admin Account"

### Running a Rehearsal

#### As Admin:
1. Log in with admin credentials
2. Search for a song using the search bar
3. Click on a song from the results to display it to all users
4. Click "Quit" to end the current song

#### As Musician:
1. Log in with your credentials
2. Wait on the main screen for the admin to select a song
3. When a song is selected, view lyrics/chords based on your instrument
4. Use auto-scroll for hands-free reading

## Project Structure

```
JaMoveo/
├── client/                  # React frontend
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── services/       # API service layer
│       └── utils/          # Helper functions
│
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── socket/           # Socket.io handlers
│   └── utils/            # Utility functions
│
└── package.json          # Root package file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/admin-register` - Register admin user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Songs
- `GET /api/songs` - Search songs
- `GET /api/songs/:id` - Get specific song

### Sessions
- `GET /api/sessions/active` - Get active session
- `POST /api/sessions` - Create session (admin)
- `POST /api/sessions/:id/join` - Join session

## Socket Events

### Client → Server
- `join_session` - Join a rehearsal session
- `select_song` - Admin selects a song
- `quit_song` - Admin ends current song

### Server → Client
- `song_selected` - New song selected
- `song_quit` - Current song ended
- `user_joined` - User joined session
- `user_left` - User left session

## Deployment

The app is deployed on Railway. For your own deployment:

1. Fork this repository
2. Create a Railway account
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is created as part of a job application task for Moveo.

## Acknowledgments

- Moveo for the interesting challenge
- The mucisians who inspired this solution

---

Built with ❤️ by [Itay Ost](https://github.com/itayost)
