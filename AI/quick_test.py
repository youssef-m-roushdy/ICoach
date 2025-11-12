"""
Quick test script to verify API works
"""
import requests

# Test 1: Check API is running
print("Testing API root endpoint...")
response = requests.get("http://localhost:8000/")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test 2: Predict food (replace with your image path)
print("Testing food prediction...")
image_path = "/path/to/your/food-image.jpg"  # CHANGE THIS

try:
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            "http://localhost:8000/api/food/predict",
            files=files
        )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
except FileNotFoundError:
    print(f"Error: Image not found at {image_path}")
    print("Please update the image_path in this script")
