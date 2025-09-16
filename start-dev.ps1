# Acadex Development Server Starter
# This script ensures Node.js is in PATH and starts the dev server

# Add Node.js to PATH if not already there
if ($env:PATH -notlike "*nodejs*") {
    $env:PATH += ";C:\Program Files\nodejs"
}

# Change to project directory
Set-Location "C:\Users\USer\Desktop\Acadex"

# Start the development server
npm run dev