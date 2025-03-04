// controllers/offersController.js
const { pool } = require('../db'); // Ensure this import is correct

exports.getBuyerOffers = async (req, res) => {
    const { buyer_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT o.offer_id, o.offer_price AS amount, o.status, l.title AS ad_title
            FROM offers o
            JOIN listing l ON o.ad_id = l.listing_id
            WHERE o.buyer_id = $1
        `, [buyer_id]);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('❌ Error fetching buyer offers:', error.message);
        res.status(500).json({ error: 'Error fetching buyer offers' });
    }
};

exports.getSellerOffers = async (req, res) => {
    const { seller_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT o.offer_id, o.offer_price AS amount, o.status, l.title AS ad_title
            FROM offers o
            JOIN listing l ON o.ad_id = l.listing_id
            WHERE l.seller_id = $1
        `, [seller_id]);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error('❌ Error fetching seller offers:', error.message);
        res.status(500).json({ error: 'Error fetching seller offers' });
    }
};

// Update Offer Status (Accept/Reject)
exports.updateOfferStatus = async (req, res) => {
    const { offer_id, status } = req.body;
    try {
        await pool.query(
            `UPDATE offers SET status = $1 WHERE offer_id = $2`,
            [status, offer_id]
        );
        res.status(200).json({ message: `Offer ${status} successfully` });
    } catch (error) {
        console.error('❌ Error updating offer status:', error.message);
        res.status(500).json({ error: `Error updating offer status: ${error.message}` });
    }
};

// 📝 Make an Offer
exports.makeOffer = async (req, res) => {
    const { ad_id, buyer_id, offer_price } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if Ad is still on sale
        const adCheck = await client.query(
            `SELECT status FROM Listing WHERE listing_id = $1`,
            [ad_id]
        );

        if (adCheck.rows.length === 0) {
            return res.status(404).send({ error: 'Ad not found' });
        }

        if (adCheck.rows[0].status !== 'on_sale') {
            return res.status(400).send({ error: 'Ad is not available for offers' });
        }

        // Insert the offer
        await client.query(
            `INSERT INTO Offers (ad_id, buyer_id, offer_price) 
             VALUES ($1, $2, $3)`,
            [ad_id, buyer_id, offer_price]
        );

        await client.query('COMMIT');
        res.status(201).send({ message: 'Offer made successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error making offer:', error.message);
        res.status(500).send({ error: `Error making offer: ${error.message}` });
    } finally {
        client.release();
    }
};

// 📝 Accept an Offer
exports.acceptOffer = async (req, res) => {
    const { offer_id } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Validate the offer
        const offerCheck = await client.query(
            `SELECT ad_id, offer_price, status FROM Offers WHERE offer_id = $1`,
            [offer_id]
        );

        if (offerCheck.rows.length === 0) {
            return res.status(404).send({ error: 'Offer not found' });
        }

        if (offerCheck.rows[0].status !== 'pending') {
            return res.status(400).send({ error: 'Offer is not pending' });
        }

        const { ad_id } = offerCheck.rows[0];

        // Accept the offer
        await client.query(
            `UPDATE Offers SET status = 'accepted' WHERE offer_id = $1`,
            [offer_id]
        );

        // Mark the ad as sold
        await client.query(
            `UPDATE Listing SET status = 'sold', sold_at = NOW() WHERE listing_id = $1`,
            [ad_id]
        );

        await client.query('COMMIT');
        res.status(200).send({ message: 'Offer accepted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error accepting offer:', error.message);
        res.status(500).send({ error: `Error accepting offer: ${error.message}` });
    } finally {
        client.release();
    }
};

// 📝 Reject an Offer
exports.rejectOffer = async (req, res) => {
    const { offer_id } = req.params;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Validate the offer
        const offerCheck = await client.query(
            `SELECT status FROM Offers WHERE offer_id = $1`,
            [offer_id]
        );

        if (offerCheck.rows.length === 0) {
            return res.status(404).send({ error: 'Offer not found' });
        }

        if (offerCheck.rows[0].status !== 'pending') {
            return res.status(400).send({ error: 'Offer is not pending' });
        }

        // Reject the offer
        await client.query(
            `UPDATE Offers SET status = 'rejected' WHERE offer_id = $1`,
            [offer_id]
        );

        await client.query('COMMIT');
        res.status(200).send({ message: 'Offer rejected successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error rejecting offer:', error.message);
        res.status(500).send({ error: `Error rejecting offer: ${error.message}` });
    } finally {
        client.release();
    }
};

// 📝 Get All Offers for an Ad
exports.getOffersByAdId = async (req, res) => {
    const { ad_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT offer_id, buyer_id, offer_price, status, created_at 
             FROM Offers WHERE ad_id = $1`,
            [ad_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching offers:', error.message);
        res.status(500).send({ error: `Error fetching offers: ${error.message}` });
    }
};
