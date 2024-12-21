const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken');
const {saveToHistory}=require('./callback')



// id+1 ->commant easy then verification 
const generateUniqueCommandeId = async () => {
    try {
        const id = await getCommandID();
        console.log(`Generated id: ${id}`);

        return id;

    } catch (error) {
        console.error("Error in generateUniqueCommandeId:", error);
        throw error;
    }
};


const getCommandID = async () => {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM commande', (error, rows) => {
                if (error) {
                    reject(error);
                } else {

                    resolve(rows[0].count + 1);
                }
            });
        });
        console.log("Result from getCommandID:", result);
        return result;
    } catch (error) {
        console.error("Error in getCommandID:", error);
        throw error;
    }
};




const getOrCreateCommande = async (clientId) => {
    console.log("getOrCreateCommande called with clientId:", clientId);
    try {
        const existingCommand = await new Promise((resolve, reject) => {
            db.query("SELECT idcommande FROM commande WHERE client_idclient =? AND statut_commande='enattente'", [clientId], (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                if (result.length === 0) {
                    console.log("No commande found for this client");
                    resolve(null);
                } else {
                    console.log("Existing commande found for this client:", result[0].idcommande);
                    resolve(result[0].idcommande);
                }
            });
        });
        if (existingCommand) {
            return existingCommand;
        } else {
            const currentCommandeId = await generateUniqueCommandeId();
            if (currentCommandeId) {
                const currentDate = new Date().toISOString();
                await db.query(
                    'INSERT INTO commande (idcommande, date_commande, client_idclient, description_commande, statut_commande) VALUES (?, ?, ?, "Some description", ?)',
                    [currentCommandeId, currentDate, clientId, 'enattente']
                );
                return currentCommandeId;
            }
        }
    } catch (error) {
        console.error("Error in getOrCreateCommande:", error);
        throw error;
    }
};




const AddtoCart = async (req, res) => {
    try {
        const { produitId, quantite } = req.body;
        if (!produitId || !quantite || typeof produitId !== 'number' || typeof quantite !== 'number') {
            return res.status(400).json({ message: 'Invalid request' });
        }
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const currentCommandeId = await getOrCreateCommande(authResult.decode.id);
        if (currentCommandeId) {

            const existingProduct = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT * FROM ligne_de_commande WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [produitId, currentCommandeId],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            if (existingProduct.length > 0) {
                const newQuantite = existingProduct[0].quantite_produit + quantite;
                await db.query(
                    'UPDATE ligne_de_commande SET quantite_produit = ? WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [newQuantite, produitId, currentCommandeId]
                );
            } else {
                await db.query(
                    'INSERT INTO ligne_de_commande (produit_idproduit, quantite_produit, commande_idcommande) VALUES (?, ?, ?)',
                    [produitId, quantite, currentCommandeId]
                );
            }
            res.json({ message: "Product added to cart successfully", currentCommandeId });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};



const getProductsInCart = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        let client_idclient;
        if (authResult.decode.id) {
            console.log("Client ID found in token :", authResult.decode.id);
            client_idclient = authResult.decode.id;
        } else {
            console.error("Client ID not found in token");
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Client ID:", client_idclient);

    /*    const allProducts = await new Promise((resolve, reject) => {
            const query = 'SELECT * FROM produit';
            db.query(query, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });*/

       // console.log("Cart products result:", allProducts);
        /// status expidete /// add condition enattente
        const cartProductsResult = await new Promise((resolve, reject) => {
            const query = "SELECT p.*, lc.quantite_produit FROM produit p JOIN ligne_de_commande lc ON p.idproduit = lc.produit_idproduit JOIN commande c ON lc.commande_idcommande = c.idcommande  AND c.statut_commande = 'enattente' WHERE c.client_idclient = ?";
            db.query(query, [client_idclient], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        console.log("Cart products result:", cartProductsResult);

        const cartProducts = cartProductsResult;

        console.log("Cart products:", cartProducts);

        res.json({ cartProductsResult: cartProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};




const completeCommand = async (req, res) => {
    const { currentCommandeId } = req.body;

    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!['client'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }
    if (!authResult.decode.id) {
        console.error("Client ID not found in token");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const client_idclient = authResult.decode.id;

    try {
        const commandDetails = await new Promise((resolve, reject) => {
            db.query(
                'SELECT date_commande, description_commande FROM commande WHERE idcommande = ? AND client_idclient = ?',
                [currentCommandeId, client_idclient],
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

        if (commandDetails) {
            const montantTotalCommande = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT SUM(p.prix_produit * l.quantite_produit) AS montant_total_commande FROM ligne_de_commande l JOIN produit p ON l.produit_idproduit = p.idproduit WHERE l.commande_idcommande = ?',
                    [currentCommandeId],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result[0].montant_total_commande || 0);
                        }
                    }
                );
            });

            const commandeDetails = {
                idcommande: currentCommandeId,
                date_commande: commandDetails.date_commande,
                description_commande: commandDetails.description_commande,
                montantTotalCommande,
                adresselivraison_commande: commandDetails.adresselivraison_commande,
                modepaiement_commande: commandDetails.modepaiement_commande,
                statut_commande: "enattente",
                date_livraison_commande: "2024-05-01",
                metho_delivraison_commande: "domicile",
                client_idclient: client_idclient
            };

            return res.status(200).json(commandeDetails);
        } else {
            console.log("Command details not found.");
            return res.status(404).json({ message: "Command details not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const passCommand = async (req, res) => {
    const { currentCommandeId, description_commande, adresselivraison_commande, modepaiement_commande, date_livraison_commande, metho_delivraison_commande, montant_total_commande } = req.body;
    console.log(req.body)

    const authResult = await isAuthorize(req, res);
    if (authResult.message !== 'authorized') {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
    }
    if (!authResult.decode.id) {
        console.error("Client ID not found in token");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const client_idclient = authResult.decode.id;

    try {

        const currentStatus = await new Promise((resolve, reject) => {
            db.query(
                'SELECT statut_commande FROM commande WHERE idcommande = ? AND client_idclient = ?',
                [currentCommandeId, client_idclient],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(result[0]?.statut_commande);
                    }
                }
            );
        });

        if (currentStatus === 'expédié') {
            return res.status(403).json({ message: "Command status is already 'expédié', cannot be updated." });
        }


        await new Promise((resolve, reject) => {
            db.query(
                'UPDATE commande SET description_commande = ?, adresselivraison_commande = ?, modepaiement_commande = ?, date_livraison_commande = ?, metho_delivraison_commande = ? ,montant_total_commande =? WHERE idcommande = ? AND client_idclient = ?',
                [description_commande, adresselivraison_commande, modepaiement_commande, date_livraison_commande, metho_delivraison_commande, montant_total_commande, currentCommandeId, client_idclient],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {

                        resolve(result);
                    }
                }
            );

            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la commande mis à jour', userId, userRole);
        });

        return res.status(200).json({ message: "PassCommand passed successfully" });
    } catch (error) {
        console.error("Error passing command:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};





const increaseProductQuantity = async (req, res) => {
    try {
        const { produitId } = req.body;
        if (!produitId || typeof produitId !== 'number') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const currentCommandeId = await getOrCreateCommande(authResult.decode.id);
        console.log("Current commande id:", currentCommandeId);

        if (currentCommandeId) {
            const existingProduct = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT * FROM ligne_de_commande WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [produitId, currentCommandeId],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            console.log("Existing product in cart:", existingProduct);

            if (existingProduct.length > 0) {

                const newQuantite = existingProduct[0].quantite_produit + 1;
                console.log('chaaaaaaaaaaaange',newQuantite);
                await db.query(
                    'UPDATE ligne_de_commande SET quantite_produit = ? WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [newQuantite, produitId, currentCommandeId]
                );
                return res.json({ message: "Product quantity increased successfully" });
            } else {

                return res.status(404).json({ message: "Product not found in the cart" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const decreaseProductQuantity = async (req, res) => {
    try {
        const { produitId } = req.body;
        if (!produitId || typeof produitId !== 'number') {
            return res.status(400).json({ message: 'Invalid request' });
        }


        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!['admin', 'employe', 'client'].includes(authResult.decode.role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const currentCommandeId = await getOrCreateCommande(authResult.decode.id);
        if (currentCommandeId) {
            const existingProduct = await new Promise((resolve, reject) => {
                db.query(
                    'SELECT * FROM ligne_de_commande WHERE produit_idproduit = ? AND commande_idcommande = ?',
                    [produitId, currentCommandeId],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            if (existingProduct.length > 0) {
                const currentQuantite = existingProduct[0].quantite_produit;
                if (currentQuantite > 1) {
                    const newQuantite = currentQuantite - 1;
                    await db.query(
                        'UPDATE ligne_de_commande SET quantite_produit = ? WHERE produit_idproduit = ? AND commande_idcommande = ?',
                        [newQuantite, produitId, currentCommandeId]
                    );
                    return res.json({ message: "Product quantity decreased successfully" });
                } else {
                    await db.query(
                        'DELETE FROM ligne_de_commande WHERE produit_idproduit = ? AND commande_idcommande = ?',
                        [produitId, currentCommandeId]
                    );
                    return res.json({ message: "Product removed from the cart" });
                }
            } else {
                return res.status(404).json({ message: "Product not found in the cart" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};




module.exports = {
    passCommand, completeCommand, getProductsInCart, AddtoCart,
    increaseProductQuantity, decreaseProductQuantity
};