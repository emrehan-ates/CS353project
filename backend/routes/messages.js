const express = require('express');
const { sendMessage, getMessagesBetweenUsers } = require('../controllers/messagesController');

const router = express.Router();

// Send a Message
router.post('/send', sendMessage);

// Get All Messages Between Two Users
router.get('/between/:user1_id/:user2_id', getMessagesBetweenUsers);

module.exports = router;
