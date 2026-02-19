#!/bin/bash

# SQLite Database Migration Guide for Letter App

echo "=== SQLite Migration Setup ==="

# 1. Initialize database and create tables (automatic on first API request)
echo "✓ Database schema will be created automatically on first request to /api/users"

# 2. Create .gitignore entry for SQLite database
if ! grep -q "data/app.db" .gitignore; then
    echo "data/" >> .gitignore
    echo "✓ Added data/ to .gitignore"
fi

# 3. Create data directory
mkdir -p data
echo "✓ Created data directory for SQLite database"

echo ""
echo "=== Migration Steps Complete ==="
echo ""
echo "Next steps:"
echo "1. Update remaining components to use new database hooks from /src/hooks/use-database.ts"
echo "2. Replace all Firestore imports with API calls"
echo "3. Add user via API: POST /api/users with { id, email, role, status }"
echo "4. Add consumers via API: POST /api/consumers"
echo "5. Save activities via API: POST /api/activities"
echo ""
echo "Firebase Auth is still being used for authentication."
echo "Database queries are now handled by SQLite via Next.js API routes."
