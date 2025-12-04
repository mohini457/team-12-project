# Parking Slot Availability Checker

A full-stack MERN application for real-time parking slot availability management. This system helps drivers find parking spaces efficiently while enabling parking facility managers to monitor occupancy dynamically.

## Features

### For Drivers
- 🔍 **Real-time Search**: Find available parking slots near your location
- 🗺️ **Map Integration**: View parking lots on interactive maps with GPS navigation
- 📱 **Smart Filtering**: Filter by location, slot type, price, and distance
- 📅 **Booking System**: Reserve parking slots in advance
- 🔔 **Notifications**: Get alerts for booking expiry and slot availability
- 📊 **Live Updates**: Real-time slot status updates via WebSocket

### For Parking Managers
- 🏢 **Parking Lot Management**: Register and manage multiple parking facilities
- 📈 **Occupancy Dashboard**: Real-time visualization of slot availability
- 💰 **Pricing Management**: Set hourly, daily, and monthly rates
- 📊 **Analytics**: Monitor usage patterns and peak hours
- 🔧 **Slot Management**: Update slot availability manually or via IoT sensors

### For Admins
- 👥 **User Management**: Manage drivers and facility managers
- 📊 **Platform Analytics**: System-wide statistics and insights
- ⚙️ **System Settings**: Platform configuration and verification
- 📈 **Revenue Tracking**: Monitor bookings and revenue

## Tech Stack

- **Frontend**: React, React Router, Socket.io Client, Google Maps API, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket (Socket.io)

## Project Structure

```
parking-slot-app/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── utils/       # Utility functions
│   └── public/          # Static files
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Maps API Key (for map features)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parking-slot-app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Parking Lots
- `GET /api/parking-lots` - Get all parking lots
- `GET /api/parking-lots/:id` - Get single parking lot
- `POST /api/parking-lots` - Create parking lot (Manager/Admin)
- `PUT /api/parking-lots/:id` - Update parking lot (Manager/Admin)
- `DELETE /api/parking-lots/:id` - Delete parking lot (Admin)

### Slots
- `GET /api/slots` - Get slots (with filters)
- `GET /api/slots/:id` - Get single slot
- `PUT /api/slots/:id/status` - Update slot status (Manager/Admin)
- `POST /api/slots/bulk-update` - Bulk update slots (Manager/Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/start` - Start booking
- `PUT /api/bookings/:id/complete` - Complete booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Search
- `GET /api/search` - Search parking lots with filters
- `GET /api/search/nearby` - Get nearby parking lots

### Admin
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/analytics` - Get platform analytics (Admin)
- `PUT /api/admin/users/:id` - Update user (Admin)

## User Roles

1. **Driver**: Can search, view, and book parking slots
2. **Manager**: Can manage parking lots, update slots, view analytics
3. **Admin**: Full system access including user management

## Real-time Features

The application uses WebSocket (Socket.io) for real-time updates:
- Slot status changes are broadcast instantly
- Booking updates are reflected in real-time
- Multiple users can see live availability

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `CLIENT_URL` - Frontend URL for CORS

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_GOOGLE_MAPS_API_KEY` - Google Maps API key

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] IoT sensor integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Rating and review system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@parkingfinder.com or create an issue in the repository.

