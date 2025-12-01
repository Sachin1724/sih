const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload image to Cloudinary and save to DB
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Upload to Cloudinary using buffer
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'carousel-images' },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
                }

                // Save image data to MongoDB
                const newImage = new Image({
                    url: result.secure_url,
                    publicId: result.public_id,
                    approved: false
                });

                await newImage.save();

                // Emit socket event for new upload
                req.app.get('io').emit('imageUploaded', newImage);

                res.status(201).json({
                    message: 'Image uploaded successfully',
                    image: newImage
                });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// Get all approved images for carousel
router.get('/approved', async (req, res) => {
    try {
        const approvedImages = await Image.find({ approved: true }).sort({ createdAt: -1 });
        res.json(approvedImages);
    } catch (error) {
        console.error('Error fetching approved images:', error);
        res.status(500).json({ error: 'Failed to fetch approved images' });
    }
});

// Get all unapproved images for admin dashboard
router.get('/unapproved', async (req, res) => {
    try {
        const unapprovedImages = await Image.find({ approved: false }).sort({ createdAt: -1 });
        res.json(unapprovedImages);
    } catch (error) {
        console.error('Error fetching unapproved images:', error);
        res.status(500).json({ error: 'Failed to fetch unapproved images' });
    }
});

// Approve an image
router.put('/:id/approve', async (req, res) => {
    try {
        const image = await Image.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Emit socket event for approval
        req.app.get('io').emit('imageApproved', image);

        res.json({ message: 'Image approved successfully', image });
    } catch (error) {
        console.error('Error approving image:', error);
        res.status(500).json({ error: 'Failed to approve image' });
    }
});

// Delete an image
router.delete('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // Delete from MongoDB
        await Image.findByIdAndDelete(req.params.id);

        // Emit socket event for deletion
        req.app.get('io').emit('imageDeleted', { id: req.params.id });

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

module.exports = router;
