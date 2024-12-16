// Fonction pour enregistrer une action dans la table d'historique
const db = require("../config/dbConnection");



const saveToHistory = async (description, actionPerformerId, role) => {
    try {
        let sqlQuery = '';
        let id = actionPerformerId;

        // Selon le rôle de l'utilisateur, définissez l'ID et la requête SQL appropriés
        switch (role) {
            case 'admin':
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action, admin_idadmin) VALUES (NOW(), NOW(), ?, ?)';
                break;

            case 'client':
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action, client_idclient) VALUES (NOW(), NOW(), ?, ?)';
                break;

            case 'employe':
                sqlQuery = 'INSERT INTO historique (date_action, heure_action, description_action,employe_idemploye) VALUES (NOW(), NOW(), ?, ?)';
                break;

            default:
                console.error("Rôle d'utilisateur invalide:", role);
                throw new Error("Invalid user role");
        }

        const result = await db.query(
            sqlQuery,
            [description, id]
        );
        console.log("Action enregistrée dans l'historique avec succès");
        return result;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'action dans l'historique:", error);
        throw error;
    }
};

const getInformationOfRole = async (role, id) => {
    try {
        let sqlQuery = '';

        // Depending on the user's role, set the appropriate SQL query
        switch (role) {
            case 'admin':
                sqlQuery = 'SELECT * FROM admin WHERE idadmin = ?';
                break;
            case 'client':
                sqlQuery = 'SELECT * FROM client WHERE idclient = ?';
                break;
            case 'employe':
                sqlQuery = 'SELECT * FROM employe WHERE idemploye = ?';
                break;
            default:
                console.error("Invalid user role:", role);
                throw new Error("Invalid user role");
        }

        const result = await new Promise((resolve, reject) => {
            db.query(sqlQuery, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            console.log("No information found for the given ID.");
            return null;
        }

        console.log("Information retrieved successfully");
        return result[0];
    } catch (error) {
        console.error("Error retrieving user information:", error);
        throw error;
    }
};


const formatDateForMySQL = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
};




const updateInformationOfRole = async (role, id, updatedData) => {
    try {
        let sqlQuery = '';
        let params = [];

        // Depending on the user's role, set the appropriate SQL query and parameters
        switch (role) {
            case 'admin':
                sqlQuery = `UPDATE admin SET 
                            nom_admin = ?, prenom_admin = ?, email_admin = ?, 
                            photo_admin = ?, telephone_admin = ?, adresse_admin = ?, 
                            date_de_naissance_admin = ?, genre = ?, etat_compte = ? 
                            WHERE idadmin = ?`;
                params = [
                    updatedData.nom_admin, updatedData.prenom_admin, updatedData.email_admin,
                    updatedData.photo_admin, updatedData.telephone_admin, updatedData.adresse_admin,
                    formatDateForMySQL(updatedData.date_de_naissance_admin),
                    updatedData.genre, updatedData.etat_compte, id
                ];
                break;
            case 'client':
                sqlQuery = `UPDATE client SET 
                            nom_client = ?, prenom_client = ?, email_client = ?, 
                            photo_client = ?, telephone_client = ?, adresse_client = ?, 
                            datede_naissance_client = ?, genre_client = ?, etat_compte = ? 
                            WHERE idclient = ?`;
                params = [
                    updatedData.nom_client, updatedData.prenom_client, updatedData.email_client,
                    updatedData.photo_client, updatedData.telephone_client, updatedData.adresse_client,
                    formatDateForMySQL(updatedData.datede_naissance_client),
                    updatedData.genre_client, updatedData.etat_compte, id
                ];
                break;
            case 'employe':
                sqlQuery = `UPDATE employe SET 
                            nom_employe = ?, prenom_employe = ?, email_employe = ?, 
                            ${updatedData.photo_employe ? 'photo_employe = ?, ' : ''}
                            telephone_employe = ?, adresse_employe = ?, 
                            datede_naissance_employe = ?, genre_employe = ?, etat_compte = ? 
                            WHERE idemploye = ?`;
                params = [
                    updatedData.nom_employe, updatedData.prenom_employe, updatedData.email_employe,
                    ...(updatedData.photo_employe ? [updatedData.photo_employe] : []),
                    updatedData.telephone_employe, updatedData.adresse_employe,
                    formatDateForMySQL(updatedData.datede_naissance_employe),
                    updatedData.genre_employe, updatedData.etat_compte, id
                ];
                break;
            default:
                console.error("Invalid user role:", role);
                throw new Error("Invalid user role");
        }

        const result = await new Promise((resolve, reject) => {
            db.query(sqlQuery, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
            console.log("SQL Query:", sqlQuery);
            console.log("Parameters:", params);
        });

        if (result.affectedRows === 0) {
            console.log("No information found for the given ID.");
            return null;
        }

        console.log("Information updated successfully");
        return { message: "Information updated successfully" };
    } catch (error) {
        console.error("Error updating user information:", error);
        throw error;
    }
};



const saveNotification = async (email_destinataire, message) => {
    try {
        const sqlQuery = 'INSERT INTO notification (email_destinataire, message, date) VALUES (?, ?, NOW())';
        const result = await db.query(sqlQuery, [email_destinataire, message]);
        console.log("Notification enregistrée avec succès");
        return result;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement de la notification:", error);
        throw error;
    }
};




const getUserEmail = async (id) => {
    let emailQuery = '';
    switch (role) {
        case 'admin':
            emailQuery = 'SELECT email_admin FROM admin WHERE idadmin = ?';
            break;
        case 'client':
            emailQuery = 'SELECT email_client FROM client WHERE idclient = ?';
            break;
        case 'employe':
            emailQuery = 'SELECT email_employe FROM employe WHERE idemploye = ?';
            break;
        default:
            throw new Error("Invalid user role");
    }

    const result = await db.query(emailQuery, [id]);
    return result[0][`email_${role}`];
};
const getEmailById = (idEmploye) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT email_employe FROM employe WHERE idemploye = ?';
        db.query(query, [idEmploye], (err, result) => {
            if (err) {
                console.error('Error fetching email:', err);
                return reject(err);
            }
            resolve(result[0]?.email_employe);
        });
    });
};


module.exports = { getEmailById, saveToHistory, getInformationOfRole, updateInformationOfRole, saveNotification, getUserEmail };
