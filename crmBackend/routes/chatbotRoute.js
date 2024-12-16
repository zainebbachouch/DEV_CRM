const express = require('express');
const router = express.Router();
const { insertAndEmitMessage ,getChatHistory} = require('../controllers/chatbotController');
router.get('/chat-history', getChatHistory);

module.exports = (io) => {
    insertAndEmitMessage(io);
    return router;
};
