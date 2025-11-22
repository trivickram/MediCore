#!/bin/bash

# AWS Free Tier MediCore Deployment Script
echo "🚀 Deploying MediCore to AWS Free Tier..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo "📦 Installing Serverless Framework..."
    npm install -g serverless
fi

# Create S3 bucket for frontend (must be globally unique)
BUCKET_NAME="medicore-frontend-$(date +%s)"
echo "📦 Creating S3 bucket: $BUCKET_NAME"

aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Configure S3 bucket for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set S3 bucket policy for public read access
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Create S3 bucket for file uploads
FILE_BUCKET_NAME="medicore-files-$(date +%s)"
echo "📦 Creating S3 bucket for files: $FILE_BUCKET_NAME"
aws s3 mb s3://$FILE_BUCKET_NAME --region us-east-1

# Install dependencies for Lambda deployment
echo "📦 Installing Lambda dependencies..."
cd aws-deployment
npm install

# Create .env file for deployment
cat > .env << EOF
JWT_SECRET=your_super_secure_jwt_secret_key_here_$(date +%s)
S3_BUCKET=$FILE_BUCKET_NAME
MISTRAL_API_KEY=your_mistral_api_key_here
EOF

echo "⚙️ Environment file created. Please update .env with your actual API keys."

# Deploy backend to AWS Lambda
echo "🚀 Deploying backend to AWS Lambda..."
serverless deploy --stage prod

# Get the API Gateway endpoint
API_ENDPOINT=$(serverless info --stage prod | grep "ServiceEndpoint" | awk '{print $2}')
echo "✅ Backend deployed at: $API_ENDPOINT"

# Update frontend configuration
cd ../MediCore-frontend
cp js/auth.js js/auth.js.backup
cp js/dashboard.js js/dashboard.js.backup

# Replace backend URL in frontend files
sed -i.bak "s|http://localhost:5000|$API_ENDPOINT|g" js/auth.js
sed -i.bak "s|http://localhost:5000|$API_ENDPOINT|g" js/dashboard.js

# Upload frontend to S3
echo "📦 Uploading frontend to S3..."
aws s3 sync . s3://$BUCKET_NAME --exclude "*.backup" --exclude "*.bak"

# Get website endpoint
WEBSITE_URL="http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "Frontend URL: $WEBSITE_URL"
echo "Backend API: $API_ENDPOINT"
echo "Frontend S3 Bucket: $BUCKET_NAME"
echo "Files S3 Bucket: $FILE_BUCKET_NAME"
echo ""
echo "📝 Next Steps:"
echo "1. Update .env file with your Mistral API key"
echo "2. Test the application at: $WEBSITE_URL"
echo "3. Configure custom domain (optional)"
echo ""
echo "💰 Free Tier Resources Used:"
echo "- S3 Static Website Hosting"
echo "- AWS Lambda (1M requests/month free)"
echo "- API Gateway (1M calls/month free)"
echo "- DynamoDB (25GB storage free)"
echo ""

# Clean up temporary files
rm -f bucket-policy.json

echo "✅ All done! Your MediCore application is running on AWS Free Tier."