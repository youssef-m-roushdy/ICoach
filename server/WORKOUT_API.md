# Workout API Endpoints

The workout API provides CRUD operations for managing exercise workouts with filtering, pagination, and search capabilities.

## Base URL
```
http://localhost:5000/api/v1/workouts
```

## Authentication
- **GET** endpoints (read operations) are public
- **POST, PUT, DELETE** endpoints require authentication (Bearer token)

## Endpoints

### 1. Get All Workouts
**GET** `/api/v1/workouts`

Retrieve a paginated list of workouts with optional filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `body_part` (optional): Filter by body part (e.g., "chest", "legs")
- `target_area` (optional): Filter by target area
- `equipment` (optional): Filter by equipment type
- `level` (optional): Filter by difficulty level
- `search` (optional): Search in name and description

**Example Request:**
```bash
curl "http://localhost:5000/api/v1/workouts?page=1&limit=20&body_part=chest&level=intermediate"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "body_part": "chest",
      "target_area": "upper chest",
      "name": "Incline Barbell Press",
      "equipment": "barbell",
      "level": "intermediate",
      "description": "An upper chest exercise...",
      "gif_link": "https://example.com/gif.gif",
      "local_image_path": "/public/workout_gifs/exercise_1.gif",
      "createdAt": "2025-12-10T12:00:00.000Z",
      "updatedAt": "2025-12-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 268,
    "page": 1,
    "limit": 20,
    "totalPages": 14
  }
}
```

---

### 2. Get Filter Options
**GET** `/api/v1/workouts/filters`

Get all available filter values for dropdowns/select fields.

**Example Request:**
```bash
curl "http://localhost:5000/api/v1/workouts/filters"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bodyParts": ["chest", "back", "legs", "shoulders", "arms"],
    "targetAreas": ["upper chest", "lower chest", "lats", "quads"],
    "equipment": ["barbell", "dumbbell", "bodyweight", "machine"],
    "levels": ["beginner", "intermediate", "advanced"]
  }
}
```

---

### 3. Get Workout by ID
**GET** `/api/v1/workouts/:id`

Retrieve details of a specific workout.

**Example Request:**
```bash
curl "http://localhost:5000/api/v1/workouts/1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "body_part": "chest",
    "target_area": "upper chest",
    "name": "Incline Barbell Press",
    "equipment": "barbell",
    "level": "intermediate",
    "description": "An upper chest exercise...",
    "gif_link": "https://example.com/gif.gif",
    "local_image_path": "/public/workout_gifs/exercise_1.gif",
    "createdAt": "2025-12-10T12:00:00.000Z",
    "updatedAt": "2025-12-10T12:00:00.000Z"
  }
}
```

---

### 4. Create New Workout
**POST** `/api/v1/workouts`

Create a new workout exercise (requires authentication).

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "body_part": "chest",
  "target_area": "upper chest",
  "name": "Incline Barbell Press",
  "equipment": "barbell",
  "level": "intermediate",
  "description": "An upper chest exercise using an incline bench",
  "gif_link": "https://example.com/gif.gif",
  "local_image_path": "/public/workout_gifs/exercise_269.gif"
}
```

**Required Fields:**
- `body_part` (string)
- `target_area` (string)
- `name` (string)
- `equipment` (string)
- `level` (string)

**Optional Fields:**
- `description` (string)
- `gif_link` (string - must be valid URL)
- `local_image_path` (string)

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/v1/workouts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body_part": "chest",
    "target_area": "upper chest",
    "name": "Incline Barbell Press",
    "equipment": "barbell",
    "level": "intermediate",
    "description": "An upper chest exercise"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": {
    "id": 269,
    "body_part": "chest",
    "target_area": "upper chest",
    "name": "Incline Barbell Press",
    "equipment": "barbell",
    "level": "intermediate",
    "description": "An upper chest exercise",
    "gif_link": null,
    "local_image_path": null,
    "createdAt": "2025-12-10T15:30:00.000Z",
    "updatedAt": "2025-12-10T15:30:00.000Z"
  }
}
```

---

### 5. Update Workout
**PUT** `/api/v1/workouts/:id`

Update an existing workout (requires authentication).

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:** (all fields are optional, only send what needs to be updated)
```json
{
  "level": "advanced",
  "description": "Updated description"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:5000/api/v1/workouts/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "advanced",
    "description": "Updated description"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Workout updated successfully",
  "data": {
    "id": 1,
    "body_part": "chest",
    "target_area": "upper chest",
    "name": "Incline Barbell Press",
    "equipment": "barbell",
    "level": "advanced",
    "description": "Updated description",
    "gif_link": "https://example.com/gif.gif",
    "local_image_path": "/public/workout_gifs/exercise_1.gif",
    "createdAt": "2025-12-10T12:00:00.000Z",
    "updatedAt": "2025-12-10T15:35:00.000Z"
  }
}
```

---

### 6. Delete Workout
**DELETE** `/api/v1/workouts/:id`

Delete a workout (requires authentication).

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:5000/api/v1/workouts/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Workout deleted successfully"
}
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body_part",
      "message": "Body part is required"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Workout not found"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Data Statistics

- **Total Workouts:** 268 exercises
- **Body Parts:** Multiple (chest, back, legs, shoulders, arms, etc.)
- **Difficulty Levels:** Beginner, Intermediate, Advanced
- **Equipment Types:** Barbell, Dumbbell, Bodyweight, Machine, etc.

---

## Access GIF Images

Workout demonstration GIFs are served statically:

**URL Pattern:**
```
http://localhost:5000/public/workout_gifs/exercise_<id>.gif
```

**Example:**
```
http://localhost:5000/public/workout_gifs/exercise_1.gif
```

---

## Swagger Documentation

Interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

All workout endpoints are documented there with Try-it-out functionality.
