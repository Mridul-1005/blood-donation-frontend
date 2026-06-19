#!/bin/bash

# Blood Donation App - Development Startup Script
# Usage: ./start-dev.sh

# Change to backend directory
cd "$(dirname "$0")"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Loaded environment variables from .env"
else
    echo "Warning: .env file not found. Using default values from application.properties"
fi

# Run Spring Boot application
echo "Starting Spring Boot application..."
./mvnw spring-boot:run