# Food Lens AI 🍲

A food recognition app using an **EfficientNetB0** model trained on 100 food classes (including common dishes and Arabic cuisine).

## Model Details

- **Architecture**: EfficientNetB0 with custom classification head
- **Input Size**: 224x224 RGB images
- **Classes**: 100 food categories
- **Framework**: TensorFlow/Keras

## Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the app**:
   ```bash
   streamlit run app.py
   ```

3. **Access**: Open your browser at `http://localhost:8501`

## Usage

- Upload a food image or use your camera
- The AI predicts the food type with a confidence score
- Model identifies food items, not calorie counts

## Files

- `app.py` - Streamlit web application
- `best_model_food100.keras` - Trained model weights
- `class_names.json` - Food category labels
- `food detection model.ipynb` - Training notebook