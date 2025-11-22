# Deploy MediCore Backend to AWS EC2

## Step 1: Launch EC2 Instance
1. Go to EC2 Console
2. Launch Instance
3. Choose: **Amazon Linux 2023** (Free tier eligible)
4. Instance type: **t2.micro** (Free tier)
5. Create new key pair (download .pem file)
6. Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom (5000)

## Step 2: Connect and Setup Server
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Install Node.js
sudo dnf update -y
sudo dnf install -y nodejs npm git

# Clone your repository
git clone https://github.com/mukeshpotnuru-813/cloudVault-blackend.git
cd cloudVault-blackend

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2
```

## Step 3: Configure Environment
```bash
# Create production .env file
nano .env

# Add your production values:
MONGODB_URL=mongodb+srv://vikram:pu4RlKbxkxsQqUzi@cluster0.yi2x3vw.mongodb.net/medicore?retryWrites=true&w=majority
JWT_SECRET=your_generated_secret_key
PORT=5000
```

## Step 4: Setup Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo dnf install -y nginx

# Configure Nginx
sudo nano /etc/nginx/nginx.conf

# Add server block:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Start services
sudo systemctl start nginx
sudo systemctl enable nginx
pm2 start server.js --name medicore-backend
pm2 startup
pm2 save
```

## Step 5: Configure HTTPS (Let's Encrypt)
```bash
# Install certbot
sudo dnf install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```