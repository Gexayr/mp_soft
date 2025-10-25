# Frontend Authentication Implementation

This document describes the authentication implementation in the React frontend application.

## Overview

The frontend now includes a complete authentication system that integrates with the Laravel API backend. Users must be authenticated to access the dashboard and other protected routes.

## Key Features

- **Login/Register Forms**: Fully functional forms with validation
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Token Management**: Secure token storage and management
- **User State Management**: Redux-based authentication state
- **Logout Functionality**: Complete logout with token cleanup

## File Structure

```
src/
├── services/
│   └── authService.js          # API communication service
├── actions/
│   └── authActions.js         # Redux action creators
├── components/
│   ├── ProtectedRoute.js      # Route protection wrapper
│   └── header/
│       └── AppHeaderDropdown.js # User dropdown with logout
├── views/pages/
│   ├── login/Login.js         # Login form component
│   └── register/Register.js    # Registration form component
├── store.js                   # Redux store with auth state
└── App.js                     # Main app with routing logic
```

## Authentication Flow

### 1. User Registration
- User fills out registration form
- Form validates input (name, email, password, confirmation)
- API call to `/api/register` endpoint
- On success: user is logged in and redirected to dashboard
- On error: error message displayed

### 2. User Login
- User enters email and password
- API call to `/api/login` endpoint
- On success: user is logged in and redirected to dashboard
- On error: error message displayed

### 3. Protected Routes
- All routes except `/login` and `/register` are protected
- Unauthenticated users are redirected to login page
- Authenticated users can access all protected content

### 4. Logout
- User clicks logout in header dropdown
- API call to `/api/logout` endpoint
- Token is removed from localStorage
- User is redirected to login page

## State Management

The authentication state is managed through Redux with the following structure:

```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: object | null,
    loading: boolean,
    error: string | null
  }
}
```

### Actions Available:
- `loginUser(email, password)` - Login user
- `registerUser(userData)` - Register new user
- `logoutUser()` - Logout current user
- `checkAuth()` - Check authentication status
- `setUser(user)` - Set user data

## API Integration

The frontend communicates with the Laravel API through the `authService.js`:

### Endpoints Used:
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user info

### Token Management:
- Tokens are stored in localStorage
- Tokens are automatically included in API requests
- Tokens are removed on logout

## Route Protection

The `ProtectedRoute` component wraps all protected routes:

```javascript
<ProtectedRoute>
  <DefaultLayout />
</ProtectedRoute>
```

### Behavior:
- Shows loading spinner while checking authentication
- Redirects to login if not authenticated
- Renders children if authenticated

## User Interface

### Login Page (`/login`)
- Email and password fields
- Form validation
- Error message display
- Link to registration page
- Automatic redirect if already logged in

### Registration Page (`/register`)
- Name, email, password, and confirmation fields
- Form validation (password match, length requirements)
- Error message display
- Link to login page
- Automatic redirect if already logged in

### Header Dropdown
- Shows user name in dropdown header
- Includes logout option
- Maintains existing functionality (notifications, settings, etc.)

## Error Handling

### Form Validation:
- Required field validation
- Email format validation
- Password confirmation matching
- Password length requirements

### API Error Handling:
- Network error handling
- Server error display
- Authentication failure messages
- Token expiration handling

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Ensure all API calls use HTTPS in production
3. **Token Expiration**: Implement token refresh logic if needed
4. **Input Validation**: Both client and server-side validation
5. **Error Messages**: Generic error messages to prevent information leakage

## Usage Examples

### Checking Authentication Status
```javascript
const { isAuthenticated, user } = useSelector((state) => state.auth)
```

### Dispatching Login
```javascript
const dispatch = useDispatch()
const result = await dispatch(loginUser(email, password))
```

### Protected Component
```javascript
const MyComponent = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return <div>Protected content</div>
}
```

## Testing the Implementation

1. **Start the backend**: Ensure Laravel API is running on port 8000
2. **Start the frontend**: Run `npm start` in the frontend directory
3. **Test registration**: Go to `http://localhost:3000/#/register`
4. **Test login**: Go to `http://localhost:3000/#/login`
5. **Test protected routes**: Try accessing `http://localhost:3000/#/dashboard` without login
6. **Test logout**: Login and then logout using the header dropdown

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure backend CORS middleware is configured
2. **API Connection**: Verify backend is running on correct port
3. **Token Issues**: Check localStorage for stored tokens
4. **Redirect Loops**: Ensure authentication state is properly managed

### Debug Steps:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check Redux DevTools for state changes
4. Inspect network requests in browser dev tools

This implementation provides a complete authentication system that integrates seamlessly with the Laravel API backend.
