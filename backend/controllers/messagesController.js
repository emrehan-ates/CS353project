const { pool } = require('../db');

// 📝 Send a Message
exports.sendMessage = async (req, res) => {
    const { sender_id, receiver_id, message_text } = req.body;

    if (!sender_id || !receiver_id || !message_text) {
        return res.status(400).send({ error: 'Sender ID, Receiver ID, and Message text are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Validate sender and receiver
        const senderCheck = await client.query('SELECT user_id FROM Users WHERE user_id = $1', [sender_id]);
        const receiverCheck = await client.query('SELECT user_id FROM Users WHERE user_id = $1', [receiver_id]);

        if (senderCheck.rows.length === 0 || receiverCheck.rows.length === 0) {
            return res.status(404).send({ error: 'Sender or Receiver not found' });
        }

        // Insert message into Messages table
        await client.query(
            `INSERT INTO Messages (receiver_id, sender_id, message_text, created_at) 
             VALUES ($1, $2, $3, NOW())`,
            [receiver_id, sender_id, message_text]
        );

        await client.query('COMMIT');
        res.status(201).send({ message: 'Message sent successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error sending message:', error.message);
        res.status(500).send({ error: `Error sending message: ${error.message}` });
    } finally {
        client.release();
    }
};

// 📝 Get Messages Between Two Users
exports.getMessagesBetweenUsers = async (req, res) => {
    const { user1_id, user2_id } = req.params;

    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT m.message_id, m.sender_id, m.receiver_id, m.message_text, m.created_at,
                    s.email AS sender_email, r.email AS receiver_email
             FROM Messages m
             JOIN Users s ON m.sender_id = s.user_id
             JOIN Users r ON m.receiver_id = r.user_id
             WHERE (m.sender_id = $1 AND m.receiver_id = $2)
                OR (m.sender_id = $2 AND m.receiver_id = $1)
             ORDER BY m.created_at ASC`,
            [user1_id, user2_id]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('❌ Error fetching messages:', error.message);
        res.status(500).send({ error: `Error fetching messages: ${error.message}` });
    } finally {
        client.release();
    }
};
