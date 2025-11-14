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

## Docker (API / Model Server)

There's a Dockerfile and a `docker-compose.yml` in the repository to run the FastAPI model server (and an optional Postgres DB for the nutrition data). See `DOCKER.md` for full instructions. A quick summary:

- Build the image locally:

```bash
docker build -t icoach-food-api:latest .
```

- Or start the API + Postgres using compose (development):

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000` and docs at `http://localhost:8000/docs`.

## Files

- `app.py` - Streamlit web application
- `best_model_food100.keras` - Trained model weights
- `class_names.json` - Food category labels
- `food detection model.ipynb` - Training notebook