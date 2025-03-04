const { pool } = require('../db');

// 📝 Add Funds to User Payment Method
exports.addFunds = async (req, res) => {
    const { user_id, payment_method, amount } = req.body;

    if (!user_id || !payment_method || !amount || amount <= 0) {
        return res.status(400).send({ error: 'Invalid user_id, payment_method, or amount' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if payment method exists for the user
        const paymentCheck = await client.query(
            `SELECT * FROM Payments WHERE user_id = $1 AND payment_method = $2`,
            [user_id, payment_method]
        );

        if (paymentCheck.rows.length === 0) {
            // Create a new payment method if it doesn't exist
            await client.query(
                `INSERT INTO Payments (user_id, payment_method, balance) 
                 VALUES ($1, $2, $3)`,
                [user_id, payment_method, amount]
            );
        } else {
            // Update the balance if payment method exists
            await client.query(
                `UPDATE Payments SET balance = balance + $1 
                 WHERE user_id = $2 AND payment_method = $3`,
                [amount, user_id, payment_method]
            );
        }

        await client.query('COMMIT');
        res.status(200).send({ message: 'Funds added successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error adding funds:', error.message);
        res.status(500).send({ error: `Error adding funds: ${error.message}` });
    } finally {
        client.release();
    }
};

// Handle Payment
exports.processPayment = async (req, res) => {
    const { user_id, offer_id } = req.body;

    try {
        // Fetch user balance
        const balanceResult = await pool.query(
            `SELECT balance FROM payments WHERE user_id = $1`,
            [user_id]
        );

        if (balanceResult.rows.length === 0) {
            return res.status(404).json({ error: 'User payment record not found' });
        }

        const userBalance = parseFloat(balanceResult.rows[0].balance);

        // Fetch offer amount
        const offerResult = await pool.query(
            `SELECT offer_price FROM offers WHERE offer_id = $1`,
            [offer_id]
        );

        if (offerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const offerAmount = parseFloat(offerResult.rows[0].offer_price);

        console.log('User Balance:', userBalance, 'Offer Amount:', offerAmount);

        // Check if balance is sufficient
        if (userBalance < offerAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct balance
        await pool.query(
            `UPDATE payments SET balance = balance - $1 WHERE user_id = $2`,
            [offerAmount, user_id]
        );

        // Record Transaction
        await pool.query(
            `INSERT INTO transactions (offer_id, buyer_id, seller_id, amount, payment_method, transaction_date)
             SELECT $1, o.buyer_id, l.seller_id, $2, 'balance', NOW()
             FROM offers o
             JOIN listing l ON o.ad_id = l.listing_id
             WHERE o.offer_id = $1`,
            [offer_id, offerAmount]
        );

        // Update the offer status to 'paid'
        await pool.query(
            `UPDATE offers SET status = 'paid' WHERE offer_id = $1`,
            [offer_id]
        );

        res.status(200).json({ message: 'Payment successful', status: 'paid' });
    } catch (error) {
        console.error('❌ Error processing payment:', error.message);
        res.status(500).json({ error: 'Error processing payment' });
    }
};


// 📝 Get User Payments
exports.getUserPayments = async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT payment_id, payment_method, balance 
             FROM Payments WHERE user_id = $1`,
            [user_id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching payments:', error.message);
        res.status(500).send({ error: `Error fetching payments: ${error.message}` });
    }
};

// 📝 Get Transaction History
exports.getTransactionHistory = async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT transaction_id, offer_id, amount, payment_method, transaction_date 
             FROM Transactions 
             WHERE buyer_id = $1 OR seller_id = $1 
             ORDER BY transaction_date DESC`,
            [user_id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching transaction history:', error.message);
        res.status(500).send({ error: `Error fetching transaction history: ${error.message}` });
    }
};

// Get User Balance
exports.getUserBalance = async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT balance 
            FROM Payments 
            WHERE user_id = $1
        `, [user_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No balance record found for this user' });
        }

        res.status(200).json({ balance: result.rows[0].balance });
    } catch (error) {
        console.error('❌ Error fetching balance:', error.message);
        res.status(500).json({ error: 'Error fetching balance' });
    }
};

// Get User Accepted Offers
exports.getUserAcceptedOffers = async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT o.offer_id, o.offer_price AS amount, l.title AS ad_title, o.status
            FROM Offers o
            JOIN Listing l ON o.ad_id = l.listing_id
            WHERE o.buyer_id = $1 AND o.status = 'accepted'
        `, [user_id]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching accepted offers:', error.message);
        res.status(500).json({ error: 'Error fetching accepted offers' });
    }
};

// Get User Payment History
exports.getPaymentHistory = async (req, res) => {
    const { user_id } = req.query;
    try {
        const result = await pool.query(`
            SELECT t.transaction_id, t.amount, t.payment_method, t.transaction_date
            FROM Transactions t
            WHERE t.buyer_id = $1
        `, [user_id]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching payment history:', error.message);
        res.status(500).json({ error: 'Error fetching payment history' });
    }
};

// Make Payment for an Offer
exports.makePayment = async (req, res) => {
    const { offer_id, user_id, payment_method } = req.body;

    // Validate incoming data
    if (!offer_id || !user_id || !payment_method) {
        return res.status(400).json({ error: 'Missing required fields: offer_id, user_id, or payment_method' });
    }

    try {
        await pool.query('BEGIN');

        // Check if the offer exists and is accepted
        const offer = await pool.query(`
            SELECT offer_price, seller_id 
            FROM Offers 
            WHERE offer_id = $1 AND status = 'accepted'
        `, [offer_id]);

        if (offer.rows.length === 0) {
            throw new Error('Offer not valid for payment or has already been processed');
        }

        const { offer_price, seller_id } = offer.rows[0];

        // Check if the user has enough balance
        const userBalance = await pool.query(`
            SELECT balance 
            FROM Payments 
            WHERE user_id = $1
        `, [user_id]);

        if (userBalance.rows.length === 0 || userBalance.rows[0].balance < offer_price) {
            throw new Error('Insufficient balance');
        }

        // Deduct the amount from the user's balance
        await pool.query(`
            UPDATE Payments 
            SET balance = balance - $1 
            WHERE user_id = $2
        `, [offer_price, user_id]);

        // Create a transaction record
        await pool.query(`
            INSERT INTO Transactions (offer_id, buyer_id, seller_id, amount, payment_method) 
            VALUES ($1, $2, $3, $4, $5)
        `, [offer_id, user_id, seller_id, offer_price, payment_method]);

        // Update the offer status
        await pool.query(`
            UPDATE Offers 
            SET status = 'paid' 
            WHERE offer_id = $1
        `, [offer_id]);

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Error processing payment:', error.message);
        res.status(400).json({ error: error.message });
    }
};
