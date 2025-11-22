# Deploy MediCore Frontend to AWS S3 + CloudFront

## Prerequisites
- AWS Account with Free Tier
- AWS CLI installed and configured

## Step 1: Prepare Frontend Files
```bash
# Navigate to frontend folder
cd cloudVault-frontend

# Update API URLs for production
# Edit js/auth.js and js/dashboard.js
# Change: const backendURL = "http://localhost:5000"
# To: const backendURL = "https://your-ec2-domain.com"
```

## Step 2: Create S3 Bucket
```bash
# Create bucket (replace with unique name)
aws s3 mb s3://medicore-frontend-your-unique-id

# Enable static website hosting
aws s3 website s3://medicore-frontend-your-unique-id --index-document index.html

# Upload frontend files
aws s3 sync . s3://medicore-frontend-your-unique-id --delete
```

## Step 3: Setup CloudFront Distribution
- Go to CloudFront console
- Create distribution
- Origin: Your S3 bucket
- Default root object: index.html
- Wait 15-20 minutes for deployment

## Step 4: Configure Custom Domain (Optional)
- Use Route 53 or your domain provider
- Point to CloudFront distribution