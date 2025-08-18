# Fin360 - Personal Finance Management System

## Project Overview
Fin360 is a comprehensive personal finance management system built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides users with tools to track income, expenses, investments, and financial analytics, with special administrative features for system management.

## Technical Stack

### Frontend (client/)
- **Framework**: React.js with Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Authentication**: JWT with jwt-decode
- **Routing**: React Router v7
- **Development Tools**: ESLint, PostCSS, Tailwind CSS

### Backend (server/)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Middleware**: cors, dotenv

## Project Structure

### Client Structure (/client)
```
client/
├── src/
│   ├── api/            # API integration layer
│   ├── components/     # Reusable React components
│   │   ├── FinancialNews.jsx
│   │   └── Navbar.jsx
│   ├── context/       # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/         # Main application pages
│   │   ├── AdminDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Income&Expenses.jsx
│   │   ├── Login.jsx
│   │   ├── Mortgage.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── Tax.jsx
│   ├── services/      # Business logic and API calls
│   │   ├── authService.jsx
│   │   ├── financeService.jsx
│   │   └── userService.jsx
│   └── routes/        # Routing configuration
│       └── PrivateRoute.jsx
```

### Server Structure (/server)
```
server/
├── config/           # Configuration files
│   └── db.js        # MongoDB connection setup
├── controllers/     # Request handlers
│   ├── adminController.js
│   ├── authController.js
│   ├── financeController.js
│   ├── profileController.js
│   └── transactionController.js
├── middleware/      # Express middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/         # Mongoose models
│   ├── Investment.js
│   ├── Mortgage.js
│   ├── Profile.js
│   ├── Tax.js
│   ├── Transaction.js
│   └── User.js
└── routes/         # API routes
    ├── adminRoutes.js
    ├── authRoutes.js
    ├── financeRoutes.js
    └── userRoutes.js
```

## Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String (hashed),
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}
```

### Transactions Collection
```javascript
{
  userId: ObjectId (ref: 'User'),
  amount: Number,
  type: { type: String, enum: ['income', 'expense'] },
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
}
```

### Profiles Collection
```javascript
{
  userId: ObjectId (ref: 'User'),
  monthlyIncome: Number,
  savingsGoal: Number,
  riskTolerance: String
}
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (user/admin)
- Protected routes
- Admin code verification (code: '123')

### Financial Management
- Income and expense tracking
- Categorized transactions
- Monthly summaries
- Financial analytics
- Tax calculations
- Mortgage calculator

### Admin Features
- User management
- System analytics
- Transaction monitoring
- User statistics

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/forgot-password - Password reset request

### Transactions
- GET /api/transactions - Get user transactions
- POST /api/transactions - Create transaction
- GET /api/transactions/summary - Get financial summary
- PUT /api/transactions/:id - Update transaction
- DELETE /api/transactions/:id - Delete transaction

### User Management
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update profile
- GET /api/admin/users - (Admin) Get all users
- PUT /api/admin/users/:id - (Admin) Update user

## Important Variables and Constants

### Client
- `API_URL` - Base API URL (default: "http://localhost:5000/api")
- `JWT_TOKEN_KEY` - LocalStorage key for JWT
- `AuthContext` - Global authentication context

### Server
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5000)

## Security Features
- Password hashing using bcryptjs
- JWT token expiration
- Protected API routes
- Admin authentication code
- CORS configuration
- Request validation
- Error handling middleware

## Development Setup

### Prerequisites
- Node.js >= 16
- MongoDB >= 4.4
- npm or yarn

### Environment Variables
```env
# Server (.env)
MONGO_URI=mongodb://localhost:27017/fin360
JWT_SECRET=your_jwt_secret
PORT=5000

# Client (.env)
VITE_API_URL=http://localhost:5000/api
```

### Installation
1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application
1. Start MongoDB server
2. Start backend server:
   ```bash
   cd server
   npm start
   ```
3. Start frontend development server:
   ```bash
   cd client
   npm run dev
   ```

## Error Handling
- Custom error middleware
- Client-side error boundaries
- API error responses
- Validation error handling
- Network error handling

## Data Flow
1. Client makes authenticated API request
2. Server validates JWT token
3. Server processes request through middleware
4. Controller handles business logic
5. MongoDB operations via Mongoose
6. Response sent back to client
7. Client updates UI state

## Testing
- API endpoint testing
- Authentication flow testing
- Transaction operations testing
- Admin functions testing
- User management testing
