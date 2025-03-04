const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offersController');

// Buyer Offers
router.get('/buyer', offersController.getBuyerOffers);

// Seller Offers
router.get('/seller', offersController.getSellerOffers);

// Update Offer Status
router.post('/update-status', offersController.updateOfferStatus);


// Make an Offer
router.post('/make', offersController.makeOffer);

// Accept an Offer
router.post('/:offer_id/accept', offersController.acceptOffer);

// Reject an Offer
router.post('/:offer_id/reject', offersController.rejectOffer);

// Get All Offers for an Ad
router.get('/ad/:ad_id', offersController.getOffersByAdId);

module.exports = router;
