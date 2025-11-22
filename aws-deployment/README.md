# MediCore AWS Free Tier Deployment Guide

This directory contains all the necessary files to deploy MediCore on AWS using only free tier services.

## 🎯 AWS Free Tier Services Used

- **S3**: Static website hosting + file storage (5GB free)
- **Lambda**: Backend API functions (1M requests/month free)
- **API Gateway**: RESTful API management (1M calls/month free)
- **DynamoDB**: NoSQL database (25GB storage free)
- **CloudWatch**: Basic monitoring (included free)

## 📋 Prerequisites

1. **AWS Account** with free tier access
2. **AWS CLI** installed and configured
3. **Node.js** (version 14 or higher)
4. **Serverless Framework** (`npm install -g serverless`)

## 🚀 Quick Deployment

### Option 1: Automated Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Setup Backend
```bash
cd aws-deployment
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual values
```

#### Step 2: Deploy Lambda Functions
```bash
serverless deploy --stage prod
```

#### Step 3: Setup Frontend S3 Hosting
```bash
# Create S3 bucket (replace with unique name)
aws s3 mb s3://your-unique-bucket-name --region us-east-1

# Configure for website hosting
aws s3 website s3://your-unique-bucket-name --index-document index.html

# Upload frontend files
cd ../MediCore-frontend
aws s3 sync . s3://your-unique-bucket-name
```

## 🔧 Configuration Files

### `serverless.yml`
- Defines Lambda functions and API Gateway routes
- Creates DynamoDB tables
- Sets up IAM permissions

### `package.json`
- Dependencies optimized for Lambda
- Deployment scripts

### `.env` (Create this file)
```
JWT_SECRET=your_super_secure_jwt_secret
S3_BUCKET=your-files-bucket-name
MISTRAL_API_KEY=your_mistral_api_key
```

## 📊 Cost Estimation (Monthly)

| Service | Free Tier | Typical Usage | Cost |
|---------|-----------|---------------|------|
| S3 Storage | 5GB | 2GB | $0 |
| Lambda | 1M requests | 100K requests | $0 |
| API Gateway | 1M calls | 100K calls | $0 |
| DynamoDB | 25GB | 5GB | $0 |
| Data Transfer | 1GB | 10GB | $0.90 |
| **Total** | | | **~$1/month** |

## 🏗️ Architecture

```
Frontend (S3) → CloudFront (Optional) → API Gateway → Lambda → DynamoDB
                                                   ↓
                                               S3 (Files)
```

## 🔍 Monitoring

- **CloudWatch Logs**: Lambda function logs
- **CloudWatch Metrics**: Request counts, errors, duration
- **X-Ray**: Distributed tracing (optional)

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check API Gateway CORS settings
   - Verify Lambda function headers

2. **Lambda Timeouts**
   - Increase timeout in `serverless.yml`
   - Optimize function code

3. **DynamoDB Throttling**
   - Check read/write capacity units
   - Implement exponential backoff

### Logs Access:
```bash
serverless logs -f functionName --stage prod
```

## 🔐 Security Best Practices

- Use IAM roles with minimal permissions
- Enable CloudTrail for audit logging
- Rotate JWT secrets regularly
- Use S3 bucket policies for access control

## 📈 Scaling Options

When you outgrow free tier:
1. **Lambda**: Scales automatically
2. **DynamoDB**: On-demand billing
3. **S3**: Pay per usage
4. **CloudFront**: Global CDN for better performance

## 🧹 Cleanup

To remove all resources:
```bash
serverless remove --stage prod
aws s3 rm s3://your-bucket-name --recursive
aws s3 rb s3://your-bucket-name
```

## 📞 Support

For issues with this deployment:
1. Check AWS CloudWatch logs
2. Verify environment variables
3. Test API endpoints individually
4. Check S3 bucket permissions

---

**Note**: This setup is optimized for development and small-scale production use. For enterprise applications, consider upgrading to paid AWS services for better performance and reliability.