#!/bin/bash

# Create and activate virtual environment
echo "Creating virtual environment..."
python -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment variables
echo "Setting up environment variables..."
export FLASK_APP=app.py
export FLASK_ENV=development
# export DATABASE_URL="postgresql://postgres:postgres@localhost/attendance"
export DATABASE_URL="${DATABASE_URL}"
export SECRET_KEY="${SECRET_KEY}"

# Initialize database
echo "Initializing database..."
python seed_data.py

# # Run the application
# echo "Starting the application..."
# python run.py

echo "Starting Gunicorn..."
gunicorn wsgi:app
