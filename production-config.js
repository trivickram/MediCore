// Production configuration for frontend deployment
// Update these files before deploying to S3

// js/auth.js - Line 1
// backendURL is determined below by environment detection; comment out the hardcoded declaration to avoid redeclaration.
const backendURL = "https://your-ec2-domain.com"; // Replace with your EC2 public domain

// js/dashboard.js - Update API endpoint
const API_BASE_URL = "https://your-ec2-domain.com/api";

// Alternative: Use environment-based URL detection
const backendURL = window.location.hostname === 'localhost' 
  ? "http://localhost:5000" 
  : "https://your-production-api.com";