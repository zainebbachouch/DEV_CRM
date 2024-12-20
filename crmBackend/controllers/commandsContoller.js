const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken');
const { saveToHistory } = require('./callback')


const getCustomerByIDCommand = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }


        // Check role
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { CommandId } = req.params;

        const sqlQuery = 'SELECT client.* FROM commande INNER JOIN client ON commande.client_idclient = client.idclient WHERE commande.idcommande = ?';
        //console.log("Executing SQL query:", sqlQuery);
        console.log("CommandId:::::::::::::::::::::");

        db.query(sqlQuery, [CommandId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Client information not found for command ID: " + CommandId });
            }

            res.json(result); // Assuming you only need the first result
        });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving customer information: " + error.message });
    }
};



const getAllCommands = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Role check
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Get pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 1; // Set default limit to 1
        const offset = (page - 1) * limit;

        // Query to get total number of commands
        const totalQuery = 'SELECT COUNT(*) as total FROM commande';
        db.query(totalQuery, (err, totalResult) => {
            if (err) {
                console.error('Error fetching total count:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const total = totalResult[0].total;

            // Query to get commands with pagination
            const commandsQuery = 'SELECT * FROM commande LIMIT ? OFFSET ?';
            db.query(commandsQuery, [limit, offset], (err, commandsResult) => {
                if (err) {
                    console.error('Error fetching commands:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.json({
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    commands: commandsResult
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const searchCommands = async (req, res) => {
    const { searchTerm } = req.params; // Ensure this matches the route parameter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Role check
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Query to get total number of commands that match the search term
        const totalQuery = 'SELECT COUNT(*) as total FROM commande WHERE description_commande LIKE ?';
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, [`%${searchTerm}%`], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        // Query to get commands with pagination and search term
        const commandsQuery = 'SELECT * FROM commande WHERE description_commande LIKE ? LIMIT ? OFFSET ?';
        const commandsResult = await new Promise((resolve, reject) => {
            db.query(commandsQuery, [`%${searchTerm}%`, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            commands: commandsResult, // Changed from 'products' to 'commands'
            total: total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error in searchCommands:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


const updateCommandStatus = async (req, res) => {
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = authResult.decode.role;
    if (!['admin', 'employe'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { idcommande, newStatus } = req.body;
    if (!idcommande || !newStatus) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (newStatus === 'expédié') {
        const existingInvoice = await checkExistingInvoice(idcommande);
        if (!existingInvoice) {
            try {
                await createInvoice(idcommande);
            } catch (error) {
                console.error("Error creating invoice:", error);
                return res.status(500).json({ message: "Error creating invoice" });
            }
        }
    }

    const validStatus = ['enattente', 'traitement', 'expédié', 'livré'];
    if (!validStatus.includes(newStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    const sqlQuery = 'UPDATE commande SET statut_commande = ? WHERE idcommande = ?';

    db.query(sqlQuery, [newStatus, idcommande], (err, result) => { // Include result if needed
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.affectedRows === 0) { // Check affected rows if meaningful
            return res.status(404).json({ message: "Command not found" });
        }

        res.json({ message: "Command status updated successfully" });

        const userId = authResult.decode.id;
        console.log('qui connecte', userId);

        saveToHistory('Statut de la commande mis à jour', userId, userRole);
    });
};






const checkExistingInvoice = async (idcommande) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM facture WHERE idcommande = ?',
                [idcommande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result.length > 0);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error("Error checking existing invoice:", error);
        throw error;
    }
};


const createInvoice = async (idcommande) => {
    try {
        // Récupérer le montant total de la commande et le mode de livraison depuis la table commande
        const { montant_total_commande, metho_delivraison_commande } = await getTotalAmountAndDeliveryMethod(idcommande);

        // Insertion de la facture avec les détails fournis dans le corps de la requête
        await new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO facture (date_facture, etat_facture, statut_paiement_facture, idcommande, montant_total_facture, mode_livraison_facture) VALUES (NOW(), "enAttente", "non_paye", ?, ?, ?)',
                [idcommande, montant_total_commande, metho_delivraison_commande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log("Facture créée pour l'ID de commande:", idcommande);
                        resolve(result.insertId);
                    }
                }
            );
        });
    } catch (error) {
        console.error("Erreur lors de la création de la facture:", error);
        throw error;
    }
};

const getTotalAmountAndDeliveryMethod = async (idcommande) => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query(
                'SELECT montant_total_commande, metho_delivraison_commande FROM commande WHERE idcommande = ?',
                [idcommande],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });

        return result;
    } catch (error) {
        console.error("Erreur lors de la récupération du montant total de la commande et du mode de livraison:", error);
        throw error;
    }
};





const getCommandsByClientId = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { clientId } = req.params;

    // Construct SQL query with JOIN
    const sqlQuery = 'SELECT c.* FROM commande c INNER JOIN client cl ON c.client_idclient = cl.idclient WHERE cl.idclient = ?';

    // Execute SQL query
    db.query(sqlQuery, [clientId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json(result);
    });
};


const getCommandsByCommandId = async (req, res) => {
    // Authorization check
    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Check role
    if (!['admin', 'employe'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }

    const { CommandId } = req.params;

    // Construct SQL query with JOIN
    const sqlQuery = ` SELECT * 
    FROM commande, client 
    WHERE idcommande = ? 
    AND commande.client_idclient = client.idclient
`;
    // Execute SQL query
    db.query(sqlQuery, [CommandId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        res.json(result);
    });
}
const getCommandsStats = async (req, res) => {
    // Construct SQL query with aggregated statistics
    const sqlQuery = `
        SELECT 
            COUNT(*) AS total_commands,
            SUM(montant_total_commande) AS total_revenue,
            AVG(montant_total_commande) AS average_command_value,
            COUNT(CASE WHEN statut_commande = 'enattente' THEN 1 END) AS commands_in_waiting_list,
            COUNT(CASE WHEN statut_commande = 'traitement' THEN 1 END) AS commands_in_processing,
            COUNT(CASE WHEN statut_commande = 'expédié' THEN 1 END) AS commands_sent,
            COUNT(CASE WHEN statut_commande = 'livré' THEN 1 END) AS commands_delivred,
            COUNT(CASE WHEN metho_delivraison_commande = 'domicile' THEN 1 END) AS home_delivery_count,
            COUNT(CASE WHEN metho_delivraison_commande = 'surplace' THEN 1 END) AS pickup_delivery_count
        FROM commande;
    `;

    // Execute SQL query
    db.query(sqlQuery, [], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        // Send the statistics as a JSON response
        res.json(result[0]); // result[0] contains the aggregated data
    });
};


const deleteCommand = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Role check
        if (!['admin', 'employe'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { idcommande } = req.params;

        // SQL query to delete the command
        const sqlQuery = 'DELETE FROM commande WHERE idcommande = ?';

        db.query(sqlQuery, [idcommande], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Command not found" });
            }

            res.json({ message: "Command deleted successfully" });
        });
    } catch (error) {
        console.error("Error deleting command:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {
    searchCommands, getCustomerByIDCommand, getAllCommands, updateCommandStatus,
    getCommandsByClientId, getCommandsByCommandId, getTotalAmountAndDeliveryMethod,
    checkExistingInvoice, getCommandsStats, deleteCommand
}