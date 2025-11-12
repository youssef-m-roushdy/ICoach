# Food Recognition API - Quick Start Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Navigate to AI Directory
```bash
cd /home/youssef/Desktop/Icoach-app/AI
```

### Step 2: Start the API
```bash
# Option A: Using the startup script
./start_api.sh

# Option B: Manual start
source venv/bin/activate
python main.py
```

### Step 3: Test the API
Open your browser and go to:
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## 📁 Project Structure Overview

```
AI/
├── api/                    # API source code
│   ├── config/            # Configuration & database
│   ├── models/            # Database & Pydantic models
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic (ML & DB)
│   └── utils/             # Helper functions
├── main.py                # FastAPI entry point
├── start_api.sh          # Startup script
├── test_api.py           # Testing script
├── API_README.md         # Full documentation
└── .env                  # Environment variables
```

---

## 🧪 Testing the API

### 1. Test Health Check
```bash
curl http://localhost:8000/health
```

### 2. Test Food Prediction
```bash
# Replace with your image path
python test_api.py /path/to/food-image.jpg
```

### 3. Using the Web UI
Visit http://localhost:8000/docs and:
1. Click on `/api/food/predict`
2. Click "Try it out"
3. Upload a food image
4. Click "Execute"

---

## 🔧 Configuration

Edit `.env` file to configure:

```env
# Database (must match your PostgreSQL setup)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=icoach_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123

# API Settings
PORT=8000
DEBUG=True

# CORS (add your frontend URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

---

## 📱 Integration Examples

### React Native
```javascript
const predictFood = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'food.jpg',
  });

  const response = await fetch('http://YOUR_IP:8000/api/food/predict', {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('file', imageFile);

fetch('http://localhost:8000/api/food/predict', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Food:', data.predicted_food);
  console.log('Confidence:', data.confidence);
  console.log('Nutrition:', data.food_data);
});
```

### Python
```python
import requests

url = "http://localhost:8000/api/food/predict"
files = {"file": open("food-image.jpg", "rb")}
response = requests.post(url, files=files)
result = response.json()

if result['success']:
    print(f"Food: {result['predicted_food']}")
    print(f"Calories: {result['food_data']['calories']}")
```

---

## 🎯 API Endpoints

### `GET /health`
Check API health status

### `POST /api/food/predict`
Predict food from image and get nutritional data

**Request:**
- `file`: Image file (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "predicted_food": "apple",
  "confidence": 0.95,
  "food_data": {
    "calories": 52,
    "protein": 0.26,
    ...
  }
}
```

### `POST /api/food/predict-top?top_k=5`
Get top K predictions with database matches

---

## 🐛 Troubleshooting

### API Won't Start
1. Check if port 8000 is already in use: `lsof -i :8000`
2. Kill the process: `kill -9 <PID>` or use different port in `.env`

### Database Connection Failed
1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Verify database exists: `psql -U postgres -l`

### Model Not Loading
1. Verify files exist:
   - `best_model_food100.keras`
   - `class_names.json`
2. Check file permissions

### Import Errors
```bash
source venv/bin/activate
pip install -r requirements-api.txt
```

---

## 📊 Response Examples

### Success (Food Found)
```json
{
  "success": true,
  "predicted_food": "chicken breast",
  "confidence": 0.92,
  "food_data": {
    "id": 45,
    "name": "chicken breast",
    "calories": 165,
    "protein": 31,
    "carbohydrate": 0,
    "fat": 3.6,
    "sugar": 0
  },
  "message": "Successfully identified chicken breast"
}
```

### Food Not in Database
```json
{
  "success": false,
  "predicted_food": "exotic_dish",
  "confidence": 0.85,
  "food_data": null,
  "message": "Food 'exotic_dish' was identified but not found in the nutrition database",
  "suggestions": ["chicken", "beef", "rice"]
}
```

---

## 🔐 Security Notes (Production)

1. **Set `DEBUG=False`** in production
2. **Use strong database passwords**
3. **Configure CORS** with specific origins
4. **Add authentication** (JWT tokens recommended)
5. **Implement rate limiting**
6. **Use HTTPS** in production

---

## 📚 Full Documentation

For complete API documentation, see [API_README.md](API_README.md)

---

## 🆘 Support

- **API Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health
- **Test Script**: `python test_api.py <image_path>`

---

**Happy Coding! 🎉**
