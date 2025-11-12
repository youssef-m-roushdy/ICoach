#!/bin/bash

# Food Recognition API Startup Script

echo "================================"
echo "Food Recognition API Startup"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${RED}Virtual environment not found!${NC}"
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing API dependencies...${NC}"
    pip install -r requirements-api.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo "Using default configuration..."
fi

# Check if model files exist
if [ ! -f "best_model_food100.keras" ]; then
    echo -e "${RED}Error: Model file 'best_model_food100.keras' not found!${NC}"
    exit 1
fi

if [ ! -f "class_names.json" ]; then
    echo -e "${RED}Error: Class names file 'class_names.json' not found!${NC}"
    exit 1
fi

echo -e "${GREEN}Starting Food Recognition API...${NC}"
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the API
python main.py
