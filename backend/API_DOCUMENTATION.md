# Laravel API Authentication Documentation

This Laravel backend has been configured to work as an API-only service with Laravel Sanctum authentication.

## API Endpoints

### Base URL
- Development: `http://localhost:8081/api`
- Production: `https://yourdomain.com/api`

### Authentication Endpoints

#### 1. Test API Connection
- **GET** `/api/test`
- **Description**: Test if the API is working
- **Authentication**: None required
- **Response**:
```json
{
    "success": true,
    "message": "API is working!",
    "timestamp": "2024-01-01T12:00:00.000000Z"
}
```

#### 2. User Registration
- **POST** `/api/register`
- **Description**: Register a new user
- **Authentication**: None required
- **Request Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```
- **Response** (Success - 201):
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "email_verified_at": null,
            "created_at": "2024-01-01T12:00:00.000000Z",
            "updated_at": "2024-01-01T12:00:00.000000Z"
        },
        "access_token": "1|token_string_here",
        "token_type": "Bearer"
    }
}
```

#### 3. User Login
- **POST** `/api/login`
- **Description**: Login user and get access token
- **Authentication**: None required
- **Request Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
- **Response** (Success - 200):
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "email_verified_at": null,
            "created_at": "2024-01-01T12:00:00.000000Z",
            "updated_at": "2024-01-01T12:00:00.000000Z"
        },
        "access_token": "1|token_string_here",
        "token_type": "Bearer"
    }
}
```

#### 4. Get Current User
- **GET** `/api/me`
- **Description**: Get authenticated user information
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer {token}`
- **Response** (Success - 200):
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "email_verified_at": null,
            "created_at": "2024-01-01T12:00:00.000000Z",
            "updated_at": "2024-01-01T12:00:00.000000Z"
        }
    }
}
```

#### 5. Logout
- **POST** `/api/logout`
- **Description**: Logout user and revoke current token
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer {token}`
- **Response** (Success - 200):
```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

#### 6. Refresh Token
- **POST** `/api/refresh`
- **Description**: Refresh the current access token
- **Authentication**: Required (Bearer Token)
- **Headers**: `Authorization: Bearer {token}`
- **Response** (Success - 200):
```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "access_token": "1|new_token_string_here",
        "token_type": "Bearer"
    }
}
```

## Error Responses

### Validation Errors (422)
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password field is required."]
    }
}
```

### Authentication Errors (401)
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

### Unauthorized Access (401)
```json
{
    "message": "Unauthenticated."
}
```

## Usage Examples

### Using cURL

#### Register a new user:
```bash
curl -X POST http://localhost:8081/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

#### Login:
```bash
curl -X POST http://localhost:8081/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get user info (with token):
```bash
curl -X GET http://localhost:8081/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Logout:
```bash
curl -X POST http://localhost:8081/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript/Fetch

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  return data;
};

// Get user info
const getUserInfo = async (token) => {
  const response = await fetch('/api/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

## Configuration

The API is configured with:
- **Laravel Sanctum** for API token authentication
- **CORS middleware** for cross-origin requests
- **API routes** under `/api` prefix
- **Bearer token** authentication for protected routes

## Security Notes

1. Always use HTTPS in production
2. Store tokens securely (not in localStorage for sensitive apps)
3. Implement token refresh logic
4. Set appropriate token expiration times
5. Use strong passwords and implement rate limiting
