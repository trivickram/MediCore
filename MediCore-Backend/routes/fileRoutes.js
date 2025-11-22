const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1', // Default region if not specified
});

router.post("/upload", auth, async (req, res) => {
  try {
    console.log("File upload attempt:", { 
      hasFiles: !!req.files, 
      filesKeys: req.files ? Object.keys(req.files) : [],
      userId: req.user?.userId 
    });

    // Check if file exists
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check environment variables
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.S3_BUCKET) {
      console.error("Missing S3 configuration:", {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.S3_BUCKET
      });
      return res.status(500).json({ error: "Server configuration error" });
    }

    const file = req.files.file;
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }

    console.log("Uploading file to S3:", {
      fileName: file.name,
      fileSize: file.size,
      bucket: process.env.S3_BUCKET
    });

    const s3Key = `${uuidv4()}-${file.name}`;
    const upload = await s3
      .upload({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: file.data,
        ContentType: file.mimetype,
      })
      .promise();

    console.log("S3 upload successful:", upload.Location);

    const newFile = await File.create({
      userId: req.user.userId,
      fileName: file.name,
      s3Key,
      fileUrl: upload.Location,
    });

    console.log("File record created:", newFile._id);

    res.status(200).json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ 
      error: "Failed to upload file", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// Health check endpoint for file service
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "File Upload Service",
    s3Config: {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.S3_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
