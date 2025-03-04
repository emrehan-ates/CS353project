const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const SECRET_KEY = 'your_secret_key';

exports.register = async (req, res) => {
    const { email, password, userType, nickname, ...rest } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insert into Users Table
        const userInsert = await client.query(
            'INSERT INTO Users (email, password) VALUES ($1, $2) RETURNING user_id',
            [email, hashedPassword]
        );

        const userId = userInsert.rows[0].user_id;

        if (userType === 'buyer') {
            await client.query(
                'INSERT INTO Buyer (user_id, forename, surname, notification_preference) VALUES ($1, $2, $3, $4)',
                [userId, rest.forename, rest.surname, rest.notification_preference]
            );
        } else if (userType === 'seller') {
            await client.query(
                `INSERT INTO Seller (user_id, forename, surname, notification_preference, city, province, district, street, postal_code) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    userId,
                    rest.forename,
                    rest.surname,
                    rest.notification_preference,
                    rest.city,
                    rest.province,
                    rest.district,
                    rest.street,
                    rest.postal_code,
                ]
            );
        } else if (userType === 'admin') {
            if (!nickname) {
                throw new Error('Admin registration requires a nickname');
            }
            await client.query(
                'INSERT INTO Admin (user_id, nickname) VALUES ($1, $2)',
                [userId, nickname]
            );
        }

        await client.query('COMMIT');
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Registration Error:', error.message);
        res.status(500).send({ error: `Error registering user: ${error.message}` });
    } finally {
        client.release();
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required' });
    }

    try {
        const userResult = await pool.query(
            `SELECT * FROM Users WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // Ensure user password exists in the database and is hashed
        if (!user.password) {
            return res.status(500).send({ error: 'User password is missing or not hashed' });
        }

        // Compare hashed password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const roleResult = await pool.query(
            `SELECT 'admin' AS role FROM Admin WHERE user_id = $1
             UNION ALL
             SELECT 'user' AS role FROM Buyer WHERE user_id = $1
             UNION ALL
             SELECT 'user' AS role FROM Seller WHERE user_id = $1`,
            [user.user_id]
        );

        const role = roleResult.rows[0]?.role || 'user';

        res.status(200).send({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                role,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).send({ error: `Error logging in: ${error.message}` });
    }
};

// Check if User is a Seller
exports.checkSellerStatus = async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM seller WHERE user_id = $1) AS isSeller`,
        [user_id]
      );
  
      res.status(200).json({ isSeller: result.rows[0].isseller });
    } catch (error) {
      console.error('❌ Error checking seller status:', error.message);
      res.status(500).json({ error: 'Error checking seller status' });
    }
  };
  
  // Check User Role (Seller/Buyer)
exports.getUserRole = async (req, res) => {
    const { user_id } = req.params;
  
    try {
      // Check in Seller table
      const sellerResult = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM seller WHERE user_id = $1) AS isSeller`,
        [user_id]
      );
  
      // Check in Buyer table
      const buyerResult = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM buyer WHERE user_id = $1) AS isBuyer`,
        [user_id]
      );
  
      let role = 'none';
      if (sellerResult.rows[0].isseller) {
        role = 'seller';
      } else if (buyerResult.rows[0].isbuyer) {
        role = 'buyer';
      }
  
      res.status(200).json({ role });
    } catch (error) {
      console.error('❌ Error checking user role:', error.message);
      res.status(500).json({ error: 'Error checking user role' });
    }
  };
  
