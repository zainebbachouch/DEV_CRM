const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')
const { saveToHistory } = require('./callback')


const createCategorie = async (req, res) => {
    try {
        const { nom_categorie, description } = req.body;

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const existingCategorie = await db.query('SELECT * FROM categorie WHERE nom_categorie = ?', [nom_categorie]);
        if (existingCategorie.length > 0) {
            return res.status(400).json({ message: "Une catégorie avec ce nom existe déjà" });
        }

        const categorieData = {
            nom_categorie: nom_categorie,
            description: description,
        };

        const result = await db.query('INSERT INTO categorie SET ?', categorieData);
        if (result) {
            console.log("Catégorie insérée avec succès");
            console.log(result);
            res.json({ message: "Insertion réussie", nom_categorie });
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie ajouter', userId, userRole);
        } else {
            console.error("Erreur lors de l'insertion de la catégorie");
            res.status(500).json({ message: "Erreur lors de l'insertion de la catégorie" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getCategorieById = (req, res) => {
    const { id } = req.params;


    db.query('SELECT * FROM categorie WHERE idcategorie = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur interne du serveur" });
        }
        if (result.length === 0) {
            console.log("Category not found");
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        console.log("Category found:", result[0]);
        res.json(result[0]);
    });
};

/// add authorized 

const getAllCategories = async (req, res) => {
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

        // Pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
        const offset = (page - 1) * limit;

        // Queries for total count and paginated categories
        const countQuery = 'SELECT COUNT(*) AS total FROM categorie';
        const sqlQuery = 'SELECT * FROM categorie LIMIT ? OFFSET ?';

        // Execute queries in parallel
        const [countResult, categories] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(countQuery, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }),
            new Promise((resolve, reject) => {
                db.query(sqlQuery, [limit, offset], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            })
        ]);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            categories,
            total,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const searchCategorie = async (req, res) => {
    const { searchTerm } = req.params; // Ensure this matches the route parameter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        // Query to get total number of categories that match the search term
        const totalQuery = 'SELECT COUNT(*) as total FROM categorie WHERE nom_categorie LIKE ?';
        const totalResult = await new Promise((resolve, reject) => {
            db.query(totalQuery, [`%${searchTerm}%`], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const total = totalResult[0].total;

        // Query to get categories with pagination and search term
        const categoriesQuery = 'SELECT * FROM categorie WHERE nom_categorie LIKE ? LIMIT ? OFFSET ?';
        const categoriesResult = await new Promise((resolve, reject) => {
            db.query(categoriesQuery, [`%${searchTerm}%`, limit, offset], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.json({
            categories: categoriesResult, // Changed from 'products' to 'categories'
            total: total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error in searchCategorie:', error);
        res.status(500).json({ error: 'Server error' });
    }
};



const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_categorie, description } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        db.query('UPDATE categorie SET nom_categorie = ?, description = ? WHERE idcategorie = ?', [nom_categorie, description, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Catégorie non trouvée" });
            }
            res.json({ message: "Catégorie mise à jour avec succès" });
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie mis à jour', userId, userRole);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role
        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        db.query('DELETE FROM categorie WHERE idcategorie = ?', [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Catégorie non trouvée" });
            }
            res.json({ message: "Catégorie supprimée avec succès" });
            const userId = authResult.decode.id;
            const userRole = authResult.decode.role;
            console.log('qui connecte', userId)

            saveToHistory('Statut de la categorie supprimer', userId, userRole);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const revenuecontribution = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for revenue contribution:", period);

    let dateCondition;
    let dateFormat;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            dateFormat = '%Y-%m-%d';
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            dateFormat = '%Y-%u'; // Week number
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            dateFormat = '%Y';
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
            SELECT 
                c.nom_categorie AS category,
                DATE_FORMAT(f.date_facture, '${dateFormat}') AS period,
                AVG(f.montant_total_facture) AS revenu
            FROM 
                ligne_de_commande l
            JOIN 
                produit p ON l.produit_idproduit = p.idproduit
            JOIN 
                categorie c ON p.categorie_idcategorie = c.idcategorie
            JOIN 
                commande co ON l.commande_idcommande = co.idcommande
            JOIN 
                facture f ON co.idcommande = f.idcommande
            WHERE 
                f.etat_facture = 'payee' AND ${dateCondition}
            GROUP BY 
                c.nom_categorie, period;
        `;

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching total Revenue Contribution by Category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const topSellingCategories = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for top selling categories:", period);
  
    let dateCondition;
    let dateFormat;
  
    switch (period) {
      case 'daily':
        dateCondition = `DATE(f.date_facture) = CURDATE()`;
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
        dateFormat = '%Y-%u';
        break;
      case 'monthly':
        dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
        dateFormat = '%Y-%m';
        break;
      case 'yearly':
        dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
        dateFormat = '%Y';
        break;
      default:
        return res.status(400).json({ message: "Invalid period" });
    }
  
    try {
      const query = `
        SELECT 
          c.nom_categorie AS category,
          COUNT(l.produit_idproduit) AS total_products_sold,
          SUM(l.quantite_produit * p.prix_produit) AS total_sales
        FROM 
          ligne_de_commande l
        JOIN 
          produit p ON l.produit_idproduit = p.idproduit
        JOIN 
          categorie c ON p.categorie_idcategorie = c.idcategorie
        JOIN 
          commande co ON l.commande_idcommande = co.idcommande
        JOIN 
          facture f ON co.idcommande = f.idcommande
        WHERE 
          ${dateCondition} 
        GROUP BY 
          c.nom_categorie
        ORDER BY 
          total_sales DESC
        LIMIT 5;
      `;
  
      console.log("Query for top selling categories:", query); // Log the query

      const results = await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
  
      res.status(200).json(results); // Return the results
    } catch (error) {
      console.error("Error fetching top selling categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


  const getTotalSalesByCategory = async (req, res) => {
    const period = req.query.period || 'monthly';
    let dateCondition;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
            SELECT 
                c.nom_categorie AS category,
                SUM(l.quantite_produit * p.prix_produit) AS total_sales
            FROM 
                ligne_de_commande l
            JOIN 
                produit p ON l.produit_idproduit = p.idproduit
            JOIN 
                categorie c ON p.categorie_idcategorie = c.idcategorie
            JOIN 
                commande co ON l.commande_idcommande = co.idcommande
            JOIN 
                facture f ON co.idcommande = f.idcommande
            WHERE 
                ${dateCondition} AND f.etat_facture = 'payee'
            GROUP BY 
                c.nom_categorie
            ORDER BY 
                total_sales DESC;
        `;

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    console.error("Database Query Error:", err); // Log any database query error
                    return reject(err);
                }
                console.log("Query Results:", result); // Log the results from the query
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching total sales by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};





const getAverageSalesPriceByCategory = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for average sales price by category:", period);

    let dateCondition;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
        SELECT 
            c.nom_categorie AS category,
            AVG(f.montant_total_facture) AS average_price
        FROM 
            ligne_de_commande l
        JOIN 
            produit p ON l.produit_idproduit = p.idproduit
        JOIN 
            categorie c ON p.categorie_idcategorie = c.idcategorie
        JOIN 
            commande co ON l.commande_idcommande = co.idcommande
        JOIN 
            facture f ON co.idcommande = f.idcommande
        WHERE 
            ${dateCondition} AND f.etat_facture = 'payee'
        GROUP BY 
            c.nom_categorie
        ORDER BY 
            average_price DESC;
    `;

        console.log("Query for average sales price by category:", query);

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching average sales price by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const getSalesDistributionHistogram = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for sales distribution histogram:", period);

    let dateCondition;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
            SELECT
                c.nom_categorie AS category,
                SUM(f.montant_total_facture) AS total_quantity_sold
            FROM
                ligne_de_commande l
            JOIN
                produit p ON l.produit_idproduit = p.idproduit
            JOIN
                categorie c ON p.categorie_idcategorie = c.idcategorie
            JOIN
                commande co ON l.commande_idcommande = co.idcommande
            JOIN
                facture f ON co.idcommande = f.idcommande
            WHERE
                ${dateCondition} AND f.etat_facture = 'payee'
            GROUP BY
                c.nom_categorie;
        `;

        console.log("SQL Query:", query);  // Log the query

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    console.error("SQL Error:", err);  // Log SQL errors
                    return reject(err);
                }
                resolve(result);
            });
        });

        if (!results.length) {
            console.log("No data found for the given period:", period);  // Log when no data is found
            return res.status(404).json({ message: "No data found for the given period." });
        }

        const categoryAmounts = results.map(row => row.total_quantity_sold);
        const histogram = getHistogram(categoryAmounts, 5);

        res.status(200).json({ histogram });
    } catch (error) {
        console.error("Error fetching sales distribution histogram:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Histogram function
const getHistogram = (data, binCount) => {
    if (data.length === 0) return [];
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / binCount;

    const bins = Array(binCount).fill(0);

    data.forEach(amount => {
        const binIndex = Math.min(Math.floor((amount - min) / binSize), binCount - 1);
        bins[binIndex]++;
    });

    const histogram = bins.map((count, index) => ({
        binStart: min + index * binSize,
        binEnd: min + (index + 1) * binSize,
        count,
    }));

    return histogram;
};






const getCategoryTrends = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for category trends:", period);

    let dateCondition;
    let dateFormat;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) >= CURDATE() - INTERVAL 7 DAY`;
            dateFormat = '%Y-%m-%d';
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) >= YEARWEEK(CURDATE(), 1) - 4`;
            dateFormat = '%Y-%u';
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) >= MONTH(CURDATE()) - 6 AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            dateFormat = '%Y-%m';
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) >= YEAR(CURDATE()) - 5`;
            dateFormat = '%Y';
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
        SELECT 
            c.nom_categorie AS category,
            DATE_FORMAT(f.date_facture, '${dateFormat}') AS period,
            SUM(l.quantite_produit * p.prix_produit) AS total_sales
        FROM 
            ligne_de_commande l
        JOIN 
            produit p ON l.produit_idproduit = p.idproduit
        JOIN 
            categorie c ON p.categorie_idcategorie = c.idcategorie
        JOIN 
            commande co ON l.commande_idcommande = co.idcommande
        JOIN 
            facture f ON co.idcommande = f.idcommande
        WHERE 
            ${dateCondition} AND f.etat_facture = 'payee'
        GROUP BY 
            c.nom_categorie, period
        ORDER BY 
            period ASC;
    `;

        console.log("Query for category trends:", query);

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching category trends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getNumberOfProductsByCategory = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.nom_categorie AS category,
                COUNT(p.idproduit) AS number_of_products
            FROM 
                categorie c
            LEFT JOIN 
                produit p ON c.idcategorie = p.categorie_idcategorie
            GROUP BY 
                c.nom_categorie
            ORDER BY 
                number_of_products DESC;
        `;

        const totalProductsQuery = `SELECT COUNT(*) AS total_products FROM produit;`;
        const totalCategoriesQuery = `SELECT COUNT(*) AS total_categories FROM categorie;`;

        console.log("Query for number of products by category:", query);

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const totalProductsResult = await new Promise((resolve, reject) => {
            db.query(totalProductsQuery, (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        const totalCategoriesResult = await new Promise((resolve, reject) => {
            db.query(totalCategoriesQuery, (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        res.status(200).json({
            categories: results,
            total_products: totalProductsResult.total_products,
            total_categories: totalCategoriesResult.total_categories
        });
    } catch (error) {
        console.error("Error fetching number of products by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



const getRevenueContributionByCategory = async (req, res) => {
    const period = req.query.period || 'monthly';
    console.log("Period for revenue contribution by category:", period);

    let dateCondition;

    switch (period) {
        case 'daily':
            dateCondition = `DATE(f.date_facture) = CURDATE()`;
            break;
        case 'weekly':
            dateCondition = `YEARWEEK(f.date_facture, 1) = YEARWEEK(CURDATE(), 1)`;
            break;
        case 'monthly':
            dateCondition = `MONTH(f.date_facture) = MONTH(CURDATE()) AND YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        case 'yearly':
            dateCondition = `YEAR(f.date_facture) = YEAR(CURDATE())`;
            break;
        default:
            return res.status(400).json({ message: "Invalid period" });
    }

    try {
        const query = `
        SELECT 
            c.nom_categorie AS category,
            SUM(l.quantite_produit * p.prix_produit) AS revenue_contribution
        FROM 
            ligne_de_commande l
        JOIN 
            produit p ON l.produit_idproduit = p.idproduit
        JOIN 
            categorie c ON p.categorie_idcategorie = c.idcategorie
        JOIN 
            commande co ON l.commande_idcommande = co.idcommande
        JOIN 
            facture f ON co.idcommande = f.idcommande
        WHERE 
            ${dateCondition} AND f.etat_facture = 'payee'
        GROUP BY 
            c.nom_categorie
        ORDER BY 
            revenue_contribution DESC;
    `;

        console.log("Query for revenue contribution by category:", query);

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching revenue contribution by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getStockLevelsByCategory = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.nom_categorie AS category,
                SUM(p.quantite_stock) AS stock_levels
            FROM 
                categorie c
            JOIN 
                produit p ON c.idcategorie = p.categorie_idcategorie
            GROUP BY 
                c.nom_categorie
            ORDER BY 
                stock_levels DESC;
        ;`

        console.log("Query for stock levels by category:", query);

        const results = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching stock levels by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = {
    revenuecontribution,topSellingCategories,
    getTotalSalesByCategory,
    getAverageSalesPriceByCategory,
    getSalesDistributionHistogram,
    topSellingCategories,
    getCategoryTrends,
    getNumberOfProductsByCategory,
    getRevenueContributionByCategory,
    searchCategorie, createCategorie, getCategorieById, getAllCategories, updateCategorie, deleteCategorie }


