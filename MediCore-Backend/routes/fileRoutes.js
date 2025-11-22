const express = require("express");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

router.post("/upload", auth, async (req, res) => {
  try {
    // Check if file exists
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
    }

    const s3Key = `${uuidv4()}-${file.name}`;
    const upload = await s3
      .upload({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: file.data,
        ContentType: file.mimetype,
      })
      .promise();

    const newFile = await File.create({
      userId: req.user.userId,
      fileName: file.name,
      s3Key,
      fileUrl: upload.Location,
    });

    res.status(200).json({ message: "File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ 
      error: "Failed to upload file", 
      details: error.message 
    });
  }
});

router.get("/my", auth, async (req, res) => {
  const files = await File.find({ userId: req.user.userId }).sort({
    createdAt: -1,
  });
  res.json(files);
});

module.exports = router;
