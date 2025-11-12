# Food Recognition API

A RESTful API built with FastAPI that provides AI-powered food recognition with nutritional database integration.

## 🚀 Features

- **AI Food Recognition**: Uses EfficientNetB0 model trained on 100 food classes
- **Database Integration**: Fetches nutritional data from PostgreSQL database
- **Smart Fallback**: Provides alternative predictions and suggestions when food not found
- **RESTful API**: Clean, well-documented REST API with automatic interactive docs
- **CORS Enabled**: Ready for integration with web and mobile applications

## 📁 Project Structure

```
AI/
├── api/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py       # Configuration management
│   │   └── database.py       # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py       # SQLAlchemy models
│   │   └── schemas.py        # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── food.py          # Food prediction endpoints
│   │   └── health.py        # Health check endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ml_service.py    # ML model service
│   │   └── db_service.py    # Database service
│   └── utils/
│       ├── __init__.py
│       └── helpers.py        # Utility functions
├── main.py                   # FastAPI application entry point
├── best_model_food100.keras  # Trained model
├── class_names.json          # Food class names
├── requirements-api.txt      # API dependencies
└── .env                      # Environment variables
```

## 🛠️ Installation

### 1. Create Virtual Environment

```bash
cd AI
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements-api.txt
```

### 3. Configure Environment

Create or update `.env` file with your database credentials:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=icoach_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### 4. Ensure Database is Running

Make sure your PostgreSQL database is running and the `foods` table exists.

## 🚀 Running the API

### Development Mode

```bash
# From the AI directory
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📖 API Endpoints

### Health Check

```http
GET /health
```

Returns API health status, version, and component status.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "model_loaded": true,
  "database_connected": true
}
```

### Predict Food

```http
POST /api/food/predict
Content-Type: multipart/form-data
```

Upload an image to identify the food and get nutritional data.

**Request:**
- `file`: Image file (JPG, PNG, WEBP)

**Response (Success):**
```json
{
  "success": true,
  "predicted_food": "apple",
  "confidence": 0.95,
  "food_data": {
    "id": 1,
    "name": "apple",
    "calories": 52,
    "protein": 0.26,
    "carbohydrate": 13.81,
    "fat": 0.17,
    "sugar": 10.39,
    "pic": null,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  },
  "message": "Successfully identified apple"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "predicted_food": "exotic_fruit",
  "confidence": 0.87,
  "food_data": null,
  "message": "Food 'exotic_fruit' was identified but not found in the nutrition database",
  "suggestions": ["fruit", "apple", "orange"]
}
```

### Get Top K Predictions

```http
POST /api/food/predict-top?top_k=5
Content-Type: multipart/form-data
```

Get multiple predictions with confidence scores.

**Request:**
- `file`: Image file
- `top_k`: Number of predictions (query parameter, default: 5)

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "food_name": "apple",
      "confidence": 0.95,
      "in_database": true,
      "food_data": { ... }
    },
    {
      "food_name": "pear",
      "confidence": 0.03,
      "in_database": true,
      "food_data": { ... }
    }
  ],
  "total": 5
}
```

## 🧪 Testing the API

### Using cURL

```bash
# Predict food from image
curl -X POST "http://localhost:8000/api/food/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/food-image.jpg"

# Health check
curl -X GET "http://localhost:8000/health"
```

### Using Python

```python
import requests

# Predict food
url = "http://localhost:8000/api/food/predict"
files = {"file": open("food-image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', imageFile);

fetch('http://localhost:8000/api/food/predict', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🔧 Configuration

Edit `.env` file to customize:

- `PORT`: API port (default: 8000)
- `DEBUG`: Debug mode (default: True)
- `POSTGRES_*`: Database credentials
- `MAX_UPLOAD_SIZE`: Maximum file upload size in bytes
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## 📝 Model Information

- **Architecture**: EfficientNetB0 with custom classification head
- **Input Size**: 224x224 RGB images
- **Classes**: 100 food categories
- **Framework**: TensorFlow/Keras

## 🔒 Security Notes

- Set `DEBUG=False` in production
- Use strong database passwords
- Configure CORS origins appropriately
- Consider adding authentication for production use
- Implement rate limiting for public APIs

## 🐛 Troubleshooting

### Model Not Loading
- Ensure `best_model_food100.keras` and `class_names.json` are in the AI directory
- Check file permissions

### Database Connection Failed
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure `foods` table exists

### Import Errors
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements-api.txt`

## 📚 API Documentation

Visit http://localhost:8000/docs for interactive API documentation with Swagger UI.

## 🤝 Integration with Mobile/Web Apps

The API is designed to be easily integrated with:
- React Native applications
- Next.js web applications
- Mobile apps (iOS/Android)
- Any HTTP client

Example integration in React Native:

```javascript
const predictFood = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'food.jpg',
  });

  const response = await fetch('http://YOUR_API_URL:8000/api/food/predict', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

## 📄 License

Part of the Icoach Application

---

**Developed by**: Mazen Ashraf (AI/ML Engineer)
**API Version**: 1.0.0
