# API Documentation Summary

## 🎯 Available Endpoints

### 1. **POST /api/food/predict** - Main Food Recognition Endpoint

**Purpose**: Identify a single food item from an image and retrieve its nutritional data.

**How to Use**:
```bash
curl -X POST "http://localhost:8000/api/food/predict" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@food-image.jpg"
```

**What It Does**:
1. Accepts a food image (JPG, PNG, WEBP)
2. Uses AI to identify the food with confidence score
3. Looks up nutritional data in the database
4. Returns complete nutrition information
5. Provides suggestions if food not found

**Response Example** (Success):
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

**Response Example** (Not Found):
```json
{
  "success": false,
  "predicted_food": "exotic_dish",
  "confidence": 0.85,
  "food_data": null,
  "message": "Food identified but not found in nutrition database",
  "suggestions": ["chicken", "beef", "rice"]
}
```

**Use Cases**:
- 📱 Mobile food tracking apps
- 💪 Fitness nutrition monitoring
- 🍽️ Meal logging applications
- 🏥 Healthcare dietary apps

---

### 2. **POST /api/food/predict-top?top_k=5** - Multiple Predictions Endpoint

**Purpose**: Get multiple AI predictions with confidence scores and database availability.

**How to Use**:
```bash
curl -X POST "http://localhost:8000/api/food/predict-top?top_k=5" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@food-image.jpg"
```

**Parameters**:
- `file`: Food image file (required)
- `top_k`: Number of predictions (optional, default: 5, range: 1-10)

**What It Does**:
1. Returns multiple possible food matches
2. Each prediction includes confidence score
3. Shows if food exists in database
4. Includes nutrition data when available
5. Ranked by confidence (highest first)

**Response Example**:
```json
{
  "success": true,
  "predictions": [
    {
      "food_name": "chicken breast",
      "confidence": 0.92,
      "in_database": true,
      "food_data": {
        "calories": 165,
        "protein": 31,
        "carbohydrate": 0,
        "fat": 3.6
      }
    },
    {
      "food_name": "turkey breast",
      "confidence": 0.05,
      "in_database": true,
      "food_data": {...}
    },
    {
      "food_name": "fish fillet",
      "confidence": 0.02,
      "in_database": false,
      "food_data": null
    }
  ],
  "total": 3
}
```

**Use Cases**:
- 🤔 When food identification is uncertain
- 📊 Showing multiple options to users
- 🔍 Letting users choose correct food
- 🧪 Testing and debugging
- 📈 Understanding model confidence

---

## 🚀 Quick Integration Guide

### React Native Example:
```javascript
// Take photo and identify food
const identifyFood = async (imageUri) => {
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

  const data = await response.json();
  
  if (data.success) {
    console.log('Food:', data.predicted_food);
    console.log('Calories:', data.food_data.calories);
  }
};
```

### JavaScript/Web Example:
```javascript
const fileInput = document.getElementById('foodImage');
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/api/food/predict', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    displayNutrition(data.food_data);
  }
});
```

### Python Example:
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

## 📋 Request Requirements

### Image Requirements:
- **Formats**: JPG, JPEG, PNG, WEBP
- **Max Size**: 10MB
- **Recommended**: Clear, well-lit food photos
- **Resolution**: Any (auto-resized to 224x224 for model)

### Network Requirements:
- **Method**: POST with multipart/form-data
- **CORS**: Enabled for configured origins
- **Authentication**: None (add if needed for production)

---

## 🔍 Understanding Responses

### Success Field:
- `true`: Food identified AND found in database
- `false`: Food identified but NOT in database

### Confidence Score:
- `0.90-1.00`: Very confident (highly likely correct)
- `0.70-0.89`: Confident (likely correct)
- `0.50-0.69`: Moderate confidence (possibly correct)
- `0.00-0.49`: Low confidence (uncertain)

### In Database Flag:
- `true`: Nutritional data available
- `false`: Food recognized but no nutrition data

---

## 🛠️ API Configuration

**Base URL**: `http://localhost:8000` (development)

**Endpoints**:
- `/api/food/predict` - Single prediction
- `/api/food/predict-top` - Multiple predictions
- `/health` - Health check (hidden from docs)
- `/docs` - Interactive API documentation
- `/redoc` - Alternative documentation

**Environment Variables** (`.env`):
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=icoach_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

---

## 📱 Mobile App Integration Checklist

- [ ] Install expo-image-picker: `npx expo install expo-image-picker`
- [ ] Request camera permissions
- [ ] Update API URL with your server IP
- [ ] Test with sample food images
- [ ] Handle loading states
- [ ] Display nutrition data
- [ ] Handle errors gracefully
- [ ] Add retry logic
- [ ] Cache results (optional)

---

## 🎨 UI/UX Recommendations

1. **Show Preview**: Display captured image before sending
2. **Loading Indicator**: Show spinner during prediction
3. **Confidence Bar**: Visual confidence indicator
4. **Multiple Options**: Let users choose from top predictions
5. **Error Messages**: User-friendly error handling
6. **Suggestions**: Show similar foods when not found
7. **Manual Entry**: Fallback for unrecognized foods

---

## 📊 Response Status Codes

- `200`: Success - Food identified
- `400`: Bad Request - Invalid file format/size
- `500`: Server Error - Processing failed

---

## 🔐 Production Considerations

1. **Add Authentication**: JWT tokens or API keys
2. **Rate Limiting**: Prevent abuse
3. **Image Validation**: Stricter file checks
4. **Caching**: Cache predictions for identical images
5. **Monitoring**: Log predictions and errors
6. **HTTPS**: Use secure connections
7. **CDN**: Serve model from CDN for speed
8. **Scaling**: Use load balancer for multiple instances

---

## 📞 Support & Testing

**Test API**: http://localhost:8000/docs
**Health Check**: http://localhost:8000/health
**Test Script**: `python test_api.py food-image.jpg`

---

**Happy Coding! 🎉**
