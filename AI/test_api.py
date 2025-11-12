"""
Test script for the Food Recognition API
"""
import requests
import sys
from pathlib import Path


def test_health_check(base_url: str = "http://localhost:8000"):
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_food_prediction(image_path: str, base_url: str = "http://localhost:8000"):
    """Test the food prediction endpoint"""
    print(f"\nTesting food prediction with image: {image_path}")
    
    if not Path(image_path).exists():
        print(f"Error: Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{base_url}/api/food/predict", files=files)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        
        if result.get('success'):
            print(f"\n✅ Predicted Food: {result['predicted_food']}")
            print(f"✅ Confidence: {result['confidence']:.2%}")
            if result.get('food_data'):
                food = result['food_data']
                print(f"✅ Nutritional Data Found:")
                print(f"   - Calories: {food['calories']} kcal")
                print(f"   - Protein: {food['protein']}g")
                print(f"   - Carbs: {food['carbohydrate']}g")
                print(f"   - Fat: {food['fat']}g")
        else:
            print(f"\n⚠️  {result.get('message')}")
            if result.get('suggestions'):
                print(f"💡 Suggestions: {', '.join(result['suggestions'])}")
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


def test_top_k_predictions(image_path: str, top_k: int = 5, base_url: str = "http://localhost:8000"):
    """Test the top-K predictions endpoint"""
    print(f"\nTesting top-{top_k} predictions with image: {image_path}")
    
    if not Path(image_path).exists():
        print(f"Error: Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                f"{base_url}/api/food/predict-top?top_k={top_k}",
                files=files
            )
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        
        if result.get('success'):
            print(f"\n✅ Top {top_k} Predictions:")
            for i, pred in enumerate(result['predictions'], 1):
                in_db = "✓" if pred['in_database'] else "✗"
                print(f"   {i}. {pred['food_name']} - {pred['confidence']:.2%} [{in_db}]")
        
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    BASE_URL = "http://localhost:8000"
    
    print("=" * 60)
    print("Food Recognition API Test Suite")
    print("=" * 60)
    
    # Test 1: Health Check
    health_ok = test_health_check(BASE_URL)
    
    if not health_ok:
        print("\n❌ Health check failed. Make sure the API is running.")
        sys.exit(1)
    
    # Test 2: Food Prediction (if image path provided)
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_food_prediction(image_path, BASE_URL)
        test_top_k_predictions(image_path, 5, BASE_URL)
    else:
        print("\n💡 To test food prediction, run:")
        print("   python test_api.py /path/to/food-image.jpg")
    
    print("\n" + "=" * 60)
    print("Test suite completed!")
    print("=" * 60)
