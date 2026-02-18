# FoodBridge API Documentation

## Base URL

Local: `http://localhost:5000`  
Production: `https://your-api.render.com`

---

## Authentication

All protected routes require a Bearer token from Supabase Auth.

**Header:**
```
Authorization: Bearer <supabase_jwt_token>
```

To get the token:
1. User signs in via Supabase client
2. Extract `session.access_token`
3. Include in API requests

---

## API Endpoints

### 🔐 Authentication

#### POST `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "provider",
  "phone": "+1234567890",
  "organization_name": "Hotel Taj",
  "location_address": "123 Main St, Mumbai",
  "location_lat": 19.0760,
  "location_lng": 72.8777
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... },
    "profile": { ... }
  }
}
```

---

### 🍽️ Food Listings

#### POST `/api/listings/create`

**Auth Required:** Yes (Provider only)

Create a new food listing.

**Request Body:**
```json
{
  "title": "Fresh Cooked Meals",
  "description": "Mixed vegetable curry and rice",
  "quantity_kg": 15.5,
  "food_type": "Cooked Meals",
  "pickup_address": "Hotel Taj, Colaba, Mumbai",
  "pickup_lat": 19.0760,
  "pickup_lng": 72.8777,
  "pickup_time_start": "2026-02-12T10:00:00Z",
  "pickup_time_end": "2026-02-12T12:00:00Z",
  "special_instructions": "Use back entrance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Food listing created successfully",
  "data": {
    "id": "uuid",
    "title": "Fresh Cooked Meals",
    ...
  }
}
```

---

#### GET `/api/listings/my-listings`

**Auth Required:** Yes (Provider only)

Get all listings created by the authenticated provider.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Fresh Cooked Meals",
      "status": "Available",
      ...
    }
  ],
  "count": 5
}
```

---

#### GET `/api/listings/available`

**Auth Required:** Yes

Get all available food listings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Fresh Cooked Meals",
      "provider": {
        "name": "Hotel Taj",
        "phone": "+91234567890"
      },
      ...
    }
  ]
}
```

---

#### PATCH `/api/listings/:id/status`

**Auth Required:** Yes (Owner only)

Update listing status.

**Request Body:**
```json
{
  "status": "Reserved"
}
```

Valid statuses: `Available`, `Reserved`, `Collected`, `Delivered`, `Expired`

---

### 🚚 Tasks (Volunteer)

#### GET `/api/tasks/nearby?radius=10`

**Auth Required:** Yes (Volunteer only)

Get tasks within specified radius (km).

**Query Params:**
- `radius` (optional): Distance in km (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Fresh Cooked Meals",
      "distance": 2.5,
      ...
    }
  ],
  "radius": "10 km"
}
```

---

#### POST `/api/tasks/accept`

**Auth Required:** Yes (Volunteer only)

Accept a food delivery task.

**Request Body:**
```json
{
  "listing_id": "uuid",
  "recipient_id": "uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "id": "task-uuid",
    "status": "Assigned",
    ...
  }
}
```

---

#### GET `/api/tasks/my-tasks`

**Auth Required:** Yes (Volunteer only)

Get all tasks assigned to the volunteer.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "Assigned",
      "food_listing": { ... },
      ...
    }
  ]
}
```

---

#### PATCH `/api/tasks/:id/status`

**Auth Required:** Yes (Volunteer or Recipient)

Update task status.

**Request Body:**
```json
{
  "status": "PickedUp"
}
```

Valid statuses: `Assigned`, `PickedUp`, `Delivered`, `Confirmed`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented.  
For production, consider adding rate limiting middleware.

---

## Testing with Postman/Insomnia

1. Create a user via signup
2. Login via Supabase client to get JWT token
3. Add token to Authorization header
4. Make API requests

---

## Notes

- All timestamps are in ISO 8601 format
- Coordinates use decimal degrees (lat/lng)
- UUIDs are used for all IDs
- Audit logs are created automatically for key actions
