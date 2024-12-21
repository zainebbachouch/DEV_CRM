const db = require('../config/dbConnection');
const axios = require("axios");
const { isAuthorize } = require('../services/validateToken')

const userSocketMap = {};

const insertAndEmitMessage = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('send', async (messageData) => {
            console.log('Received messageData:', messageData);

            try {
                const { sender_id, rolesender, receiver_id, rolereciever, message, is_sender_bot, is_receiver_bot } = messageData;

                await db.query(
                    'INSERT INTO chatbot (sender_id, rolesender, receiver_id, rolereceiver, is_sender_bot, is_receiver_bot, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [sender_id, rolesender, receiver_id, rolereciever, is_sender_bot, is_receiver_bot, message],
                    (err, result) => {
                        if (err) {
                            console.error('Error inserting messacccge:', err);
                        } else {
                            console.log('Message inserted successfully:', result);
                        }
                    }
                );

                console.log('User message inserted into database:', messageData);

                if (is_receiver_bot) {
                    //      const chatbotResponse = await axios.post('http://127.0.0.1:5001/chatbot', { question: message });
                    const chatbotResponse = await axios.post('https://1132-34-169-12-152.ngrok-free.app/chatbot', { question: message });

                    const chatbotMessageData = {
                        sender_id: -1,
                        rolesender: 'bot',
                        receiver_id: sender_id,
                        rolereciever: rolesender,
                        is_sender_bot: true,
                        is_receiver_bot: false,
                        message: chatbotResponse.data.response
                    };

                    await db.query(
                        'INSERT INTO chatbot (sender_id, rolesender, receiver_id, rolereceiver, is_sender_bot, is_receiver_bot, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [-1, 'bot', sender_id, rolesender, true, false, chatbotResponse.data.response]
                    );

                    console.log('Chatbot response inserted into database:', chatbotMessageData);

                    io.emit('receive', { ...chatbotMessageData, timestamp: new Date().toISOString() });
                }

                io.emit('receive', { ...messageData, timestamp: new Date().toISOString() });

            } catch (error) {
                console.error('Error storing message or fetching chatbot response:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (let userId in userSocketMap) {
                if (userSocketMap[userId] === socket.id) {
                    delete userSocketMap[userId];
                    break;
                }
            }
        });
    });
};

const getChatHistory = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Extract sender_id and rolesender from query parameters
        const { sender_id: userId, rolesender: userRole } = req.query; // Use query parameters

        // Ensure that these parameters are present
        if (!userId || !userRole) {
            return res.status(400).json({ message: "Invalid parameters" });
        }

        const query = `
            SELECT * FROM chatbot 
            WHERE (sender_id = ? AND rolesender = ? AND receiver_id = -1 AND rolereceiver = 'bot')
            OR (sender_id = -1 AND rolesender = 'bot' AND receiver_id = ? AND rolereceiver = ?)
            ORDER BY timestamp ASC
        `;

        db.query(query, [userId, userRole, userId, userRole], (err, results) => {
            if (err) {
                console.error('Error fetching chat history:', err);
                return res.status(500).json({ error: 'Error fetching chat history' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { insertAndEmitMessage, getChatHistory };
