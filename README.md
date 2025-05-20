# JaMoveo

![JaMoveo Logo](https://via.placeholder.com/150x50?text=JaMoveo)

A real-time collaborative music rehearsal application for Moveo's jam sessions.

## 🎵 Project Overview

JaMoveo is a web application designed to enhance music rehearsals by allowing musicians to view synchronized song lyrics and chords from their mobile devices. The application enables an admin user to search for songs and display them to all connected musicians, with content tailored to each musician's instrument.

### Key Features

- **User Authentication**: Register with your instrument type and log in securely
- **Role-based Content**: Singers see lyrics, instrumentalists see chords and lyrics
- **Real-time Synchronization**: Admin controls what everyone sees simultaneously
- **Auto-scroll Functionality**: Hands-free scrolling for active playing
- **Mobile-Optimized Interface**: Designed for use on phones in rehearsal settings
- **High-Contrast Display**: Readable interface even in smoky rehearsal rooms
- **Multi-language Support**: Song search and display in both English and Hebrew

## 🚀 Tech Stack

- **Frontend**: React.js, Socket.io client, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

## 🔧 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/your-username/jamoveo.git
cd jamoveo
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (edit with your configuration)
cp .env.example .env

# Start server in development mode
npm run dev
```

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start client in development mode
npm start
```

## 💻 Usage

### User Types

#### Regular Musician
- Register with your instrument
- Log in and wait for the admin to select a song
- View lyrics and/or chords according to your instrument
- Use auto-scroll for hands-free playing

#### Admin User
- Register using the special admin URL
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
2. Enter a username and password
3. Click "Create Admin Account"

## 📁 Project Structure

```
jamoveo/
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   └── src/                 # React source code
│       ├── components/      # Reusable components
│       ├── pages/           # Page components
│       ├── context/         # React context providers
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API services
│       ├── utils/           # Utility functions
│       └── App.js           # Main application component
│
├── server/                  # Backend Node.js application
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── server.js            # Entry point
│
└── README.md                # This file
```

## 📝 API Documentation

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Songs
- `GET /api/songs` - Search songs with query parameters
- `GET /api/songs/:id` - Get a specific song

### Sessions
- `POST /api/sessions` - Create a new session (admin only)
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/join` - Join a session

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 🚀 Deployment

The application can be deployed using various platforms. For example:

- Frontend: Vercel, Netlify, or AWS Amplify
- Backend: Heroku, Railway, or AWS EC2
- Database: MongoDB Atlas

Detailed deployment instructions will be provided in a separate document.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Project Link: [https://github.com/your-username/jamoveo](https://github.com/your-username/jamoveo)

---

Made with ❤️ for Moveo's music enthusiasts
