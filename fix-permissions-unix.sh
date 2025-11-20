#!/bin/bash

# Permission Fix & Cleanup Script for Mac/Linux
# Run this script if you have permission issues

echo "========================================"
echo "iCoach App - Permission Fix & Cleanup"
echo "========================================"
echo ""

echo "⚠️  WARNING: This will delete temporary files!"
echo "   - .expo folders"
echo "   - node_modules folders"
echo "   - Build cache"
echo ""

read -p "Continue? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# Function to safely remove directory
remove_safe_directory() {
    if [ -d "$1" ]; then
        echo "Removing: $1"
        if rm -rf "$1" 2>/dev/null; then
            echo "✅ Removed: $1"
        else
            echo "⚠️  Could not remove: $1"
            echo "   Trying with sudo..."
            if sudo rm -rf "$1"; then
                echo "✅ Removed with sudo: $1"
            else
                echo "❌ Failed to remove: $1"
            fi
        fi
    else
        echo "⏭️  Skipped (not found): $1"
    fi
}

# Fix ownership first (for files created with sudo)
echo "Fixing file ownership..."
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sudo chown -R $USER:staff . 2>/dev/null
    echo "✅ Ownership fixed (macOS)"
else
    # Linux
    sudo chown -R $USER:$USER . 2>/dev/null
    echo "✅ Ownership fixed (Linux)"
fi
echo ""

# Clean application folder
echo "Cleaning application folder..."
remove_safe_directory "application/.expo"
remove_safe_directory "application/node_modules"
remove_safe_directory "application/android"
remove_safe_directory "application/ios"
remove_safe_directory "application/.expo-shared"

# Clean server folder
echo ""
echo "Cleaning server folder..."
remove_safe_directory "server/.expo"
remove_safe_directory "server/node_modules"

# Clean AI folder
echo ""
echo "Cleaning AI folder..."
remove_safe_directory "AI/.expo"
remove_safe_directory "AI/node_modules"

# Clean root
echo ""
echo "Cleaning root folder..."
remove_safe_directory ".expo"
remove_safe_directory "node_modules"

echo ""
echo "========================================"
echo "Cleanup Complete!"
echo "========================================"
echo ""

echo "Next Steps:"
echo ""
echo "1. Reinstall dependencies (application):"
echo "   cd application"
echo "   npm install"
echo ""
echo "2. Reinstall dependencies (server - if needed):"
echo "   cd server"
echo "   npm install"
echo ""
echo "3. Try building again:"
echo "   cd application"
echo "   eas build --profile development --platform android --clear-cache"
echo ""
echo "⚠️  IMPORTANT: Never use 'sudo' with npm/expo commands!"
echo ""
