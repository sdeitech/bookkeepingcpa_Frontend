# Plurify Frontend - Authentication System

A modern React authentication system built with Vite, Redux Toolkit, and RTK Query.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 📝 **User Registration** - Sign up with email and password
- 🔑 **User Login** - Secure login with credentials
- 🛡️ **Protected Routes** - Dashboard accessible only to authenticated users
- 💾 **Persistent Sessions** - Authentication state persisted in localStorage
- 🎨 **Modern UI** - Clean and responsive design
- 🚀 **Redux Toolkit** - Efficient state management
- 🔄 **RTK Query** - Powerful data fetching and caching

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching (built-in fetch)
- **React Router v6** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Plurify Backend running on port 8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
plurify_Frontend/
├── src/
│   ├── app/
│   │   └── store.js         # Redux store configuration
│   ├── features/auth/
│   │   ├── authApi.js       # RTK Query API endpoints
│   │   └── authSlice.js     # Auth Redux slice
│   ├── components/
│   │   └── ProtectedRoute.jsx  # Route protection component
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Signup page
│   │   └── Dashboard.jsx    # Protected dashboard
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # App entry point
│   ├── App.css              # Component styles
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Project dependencies
```

## Available Routes

- `/` - Redirects to login or dashboard
- `/login` - User login page
- `/signup` - User registration page
- `/dashboard` - Protected dashboard (requires authentication)

## API Endpoints Used

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/google` - Google OAuth
- `GET /api/users` - Get all users (displayed in dashboard)

## Environment Configuration

The frontend is configured to proxy API requests to `http://localhost:8080` (backend server).

To change the backend URL, update `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // Change this to your backend URL
    changeOrigin: true,
  }
}
```

## Features in Detail

### Authentication Flow
1. User signs up or logs in
2. Backend returns JWT token and user data
3. Token stored in localStorage and Redux state
4. Token automatically included in API requests
5. Protected routes check authentication status

### State Management
- Redux Toolkit for global state
- RTK Query for API state and caching
- Authentication state persisted across sessions

### Security
- JWT tokens for authentication
- Protected routes prevent unauthorized access
- Form validation on client side
- Secure password handling

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Testing the Application

1. **Start the backend:**
```bash
cd ../plurify_Backend
npm run dev
```

2. **Start the frontend:**
```bash
cd ../plurify_Frontend
npm run dev
```

3. **Test signup:**
   - Navigate to `/signup`
   - Fill in the registration form
   - Submit to create account

4. **Test login:**
   - Navigate to `/login`
   - Enter credentials
   - Submit to access dashboard

5. **Test protected route:**
   - Try accessing `/dashboard` without login
   - Should redirect to login page

6. **Test logout:**
   - Click logout button in dashboard
   - Should redirect to login page

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 8080
- Check CORS settings in backend
- Verify MongoDB is running

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Authentication Issues
- Check localStorage for token
- Verify token expiration (50 hours)
- Check browser console for API errors

## License

MIT