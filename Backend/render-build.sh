#!/bin/bash

# Render build script for FastAPI backend
echo "Starting FastAPI backend build for Render..."

# Install dependencies
pip install -r requirements.txt

# Set Python path
export PYTHONPATH=$PYTHONPATH:$(pwd)

echo "Backend build completed successfully!"
echo "Ready to deploy with gunicorn server..."
