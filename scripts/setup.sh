#!/bin/bash

echo "Setting up FanHouse..."

# Create uploads directory
mkdir -p backend/uploads

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from example..."
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
  echo "Creating frontend/.env.local from example..."
  cp frontend/.env.example frontend/.env.local
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env and frontend/.env.local with your API keys"
echo "2. Run 'docker-compose up' to start all services"
echo "3. Create an admin user: docker-compose exec backend npm run create-admin"

