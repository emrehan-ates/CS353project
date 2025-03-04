const express = require('express');
const { createAd, getAds, getAdById } = require('../controllers/adsController');
const multer = require('multer');

const router = express.Router();

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'images') {
            cb(null, './uploads/images');
        } else if (file.fieldname === 'expertReport') {
            cb(null, './uploads/reports');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// Create a new Ad
router.post('/create', upload.fields([{ name: 'images' }, { name: 'expertReport' }]), createAd);

// Get all Ads
router.get('/', getAds);

// Get a single Ad by ID
router.get('/:id', getAdById);

module.exports = router;
