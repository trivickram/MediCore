#!/bin/bash
echo "🚀 Pushing fixes to GitHub..."

git add MediCore-frontend/vercel.json
git commit -m "Fix Vercel build: Configure output directory"
git push origin main

echo "✅ Changes pushed! Vercel should trigger a new build automatically."