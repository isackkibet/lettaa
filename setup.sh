#!/bin/bash

set -e

echo "=== Leta DB Setup ==="

# Check PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo "PostgreSQL is not running. Start it first:"
    echo "  sudo pg_ctlcluster 18 main start"
    exit 1
fi

# Check if role exists, create if not
if ! psql -U "$USER" -d postgres -c "" 2>/dev/null; then
    echo "Creating PostgreSQL role for $USER..."
    sudo -u postgres psql -c "CREATE ROLE $USER WITH LOGIN SUPERUSER;" 2>/dev/null || true
fi

# Create database
psql -U "$USER" -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'leta_db'" | grep -q 1 || \
    psql -U "$USER" -d postgres -c "CREATE DATABASE leta_db;"

# Run schema
psql -U "$USER" -d leta_db -f letaa_db.sql

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env — update DB_PASSWORD if needed"
fi

echo "=== Done! Database: leta_db ==="
