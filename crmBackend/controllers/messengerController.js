const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken')


const createMessage = async (req, res) => {
    try {
        const { receiver_id, rolereciever, message } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        const userRole = authResult.decode.role;
        if (userRole !== 'admin' && userRole !== 'employe' && userRole !== 'client') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Extract sender information from the decoded token
        const sender_id = authResult.decode.id;

        // Current timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert message into the database
        const result = await db.query(
            'INSERT INTO messages (sender_id, rolesender, receiver_id, rolereciever, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [sender_id, userRole, receiver_id, rolereciever, message, timestamp]
        );


        console.log(result)
        // Respond with success
        res.json({ message: "Message envoyé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const listSpamByID = async (req, res) => {
    const messageId = req.params.id;

    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userRole = authResult.decode.role;
        if (userRole !== 'admin' && userRole !== 'employe' && userRole !== 'client') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        db.query('SELECT * FROM messages WHERE id = ?', [messageId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            if (result.length === 0) {
                console.log("messageId not found");
                return res.status(404).json({ message: "messageId not found" });
            }
            console.log("messageId found:", result[0]);
            res.json(result[0]);
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'An error occurred while fetching the message' });
    }
};





/*

const createMessage = async (req, res) => {
    try {
        const { receiver_id, rolereciever, message } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        const userRole = authResult.decode.role;
        if (userRole !== 'admin' && userRole !== 'employe' && userRole !== 'client') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Extract sender information from the decoded token
        const sender_id = authResult.decode.id;

        // Current timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Send message to Flask API for spam/ham prediction
        const predictionResponse = await axios.post('http://127.0.0.1:5000/api/sendMessage', {
            receiver_id,
            rolereciever,
            message
        });

        // Get prediction result from Flask
        const prediction = predictionResponse.data.prediction;

        // Optionally, handle different predictions (e.g., log spam messages, reject, etc.)
        if (prediction === 'spam') {
            return res.status(400).json({ message: "Message identified as spam and was not sent." });
        }

        // Insert message into the database if not spam
        const result = await db.query(
            'INSERT INTO messages (sender_id, rolesender, receiver_id, rolereciever, message, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
            [sender_id, userRole, receiver_id, rolereciever, message, timestamp]
        );

        // Respond with success
        res.json({ message: "Message envoyé avec succès", message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};*/













// Récupérer toutes les notifications
const getNotifications = async (req, res) => {
    try {
        const notificationResult = await new Promise((resolve, reject) => {
            const query = 'SELECT id, email_destinataire, message, date FROM notification;';
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ notifications: notificationResult });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Ajoutez cette fonction dans votre backend (Express.js)
const searchNotifications = async (req, res) => {
    try {
        const { startDate, endDate, message } = req.query;

        let query = `
            SELECT id, email_destinataire, message, date 
            FROM notification 
            WHERE 1=1
        `;
        const values = [];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            values.push(startDate, endDate);
        }

        if (message) {
            query += ' AND message LIKE ?';
            values.push(`%${message}%`);
        }

        const notificationResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ notifications: notificationResult });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Supprimer une notification par ID
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await new Promise((resolve, reject) => {
            const query = 'DELETE FROM notification WHERE id = ?';
            db.query(query, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification non trouvée' });
        }

        res.json({ message: 'Notification supprimée avec succès' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const updateSeenNotification = async (req, res) => {
    try {
        const updateQuery = `
            UPDATE notification 
            SET seen = true 
            WHERE email_destinataire = ? AND seen = false
        `;

        const updateResult = await new Promise((resolve, reject) => {
            db.query(updateQuery, [req.body.email], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ notificationsUpdated: updateResult });

    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getUnreadCount = async (req, res) => {
    try {
        const email_destinataire = req.params.email;
        console.log("emmmmmmmmmmmmaaaaaaail ", req.params)
        const query = 'SELECT COUNT(*) as unreadCount FROM notification WHERE email_destinataire = ? AND seen=false';

        const unreadCount = await new Promise((resolve, reject) => {
            db.query(query, [email_destinataire], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result[0].unreadCount);
                }
            });
        });

        res.json({ unreadCount });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getAllHistoryById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { client_idclient, employe_idemploye, admin_idadmin } = req.query;

        if (!client_idclient && !employe_idemploye && !admin_idadmin) {
            return res.status(400).json({ message: "Bad Request: At least one ID parameter must be provided" });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM historique WHERE ';
        const conditions = [];
        const values = [];

        if (client_idclient) {
            conditions.push('client_idclient = ?');
            values.push(client_idclient);
        }

        if (employe_idemploye) {
            conditions.push('employe_idemploye = ?');
            values.push(employe_idemploye);
        }

        if (admin_idadmin) {
            conditions.push('admin_idadmin = ?');
            values.push(admin_idadmin);
        }

        query += conditions.join(' OR ') + ' LIMIT ? OFFSET ?';
        values.push(limit, offset);

        const totalQuery = 'SELECT COUNT(*) as total FROM historique WHERE ' + conditions.join(' OR ');
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, values.slice(0, -2), (err, result) => {
                if (err) return reject(err);
                resolve(result[0].total);
            });
        });

        const historiqueResult = await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            historique: historiqueResult,
            total: totalResult,
            page,
            limit,
            totalPages: Math.ceil(totalResult / limit)
        });
    } catch (error) {
        console.error('Error fetching historique:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const searchHistoryByDate = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { startDate, endDate, client_idclient, employe_idemploye, admin_idadmin, description_action } = req.query;

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        let conditions = [];
        let values = [];

        if (client_idclient) {
            conditions.push('client_idclient = ?');
            values.push(client_idclient);
        }
        if (employe_idemploye) {
            conditions.push('employe_idemploye = ?');
            values.push(employe_idemploye);
        }
        if (admin_idadmin) {
            conditions.push('admin_idadmin = ?');
            values.push(admin_idadmin);
        }
        if (startDate && endDate) {
            conditions.push('date_action BETWEEN ? AND ?');
            values.push(startDate, endDate);
        }
        if (description_action) {
            conditions.push('description_action LIKE ?');
            values.push(`%${description_action}%`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const totalResultsQuery = `SELECT COUNT(*) AS total FROM historique ${whereClause}`;
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalResultsQuery, values, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        const historyQuery = `SELECT * FROM historique ${whereClause} ORDER BY date_action DESC LIMIT ? OFFSET ?`;
        const history = await new Promise((resolve, reject) => {
            db.query(historyQuery, [...values, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            historique: history,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error searching history by date:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteHistoryById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { role } = authResult.decode;
        const { idAction } = req.params;
        const { client_idclient, employe_idemploye, admin_idadmin } = req.query;

        // Construct the SQL query to delete the record based on role
        const query = `
          DELETE FROM historique 
          WHERE idaction = ? AND (
            (? = 'client' AND client_idclient = ?) OR 
            (? = 'employe' AND employe_idemploye = ?) OR 
            (? = 'admin' AND admin_idadmin = ?)
          )
        `;

        // Values for the query
        const values = [idAction, role, client_idclient, role, employe_idemploye, role, admin_idadmin];

        await new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        res.json({ message: 'History deleted successfully' });
    } catch (error) {
        console.error('Error deleting history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};








module.exports = {
    listSpamByID,
    getNotifications,
    deleteNotification,
    updateSeenNotification,
    getUnreadCount,
    getAllHistoryById,
    deleteHistoryById,
    searchHistoryByDate,
    searchNotifications,
    createMessage

};
