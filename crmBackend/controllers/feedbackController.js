const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')

// Get all feedback
const getAllFeedback = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;  // 'client', 'employee', or 'admin'

        // Determine the user column to use for the reaction join
        let reactionJoinCondition = '';
        if (userRole === 'client') {
            reactionJoinCondition = `fr.client_id = ${userId}`;
        } else if (userRole === 'employe') {
            reactionJoinCondition = `fr.employe_id = ${userId}`;
        } else if (userRole === 'admin') {
            reactionJoinCondition = `fr.admin_id = ${userId}`;
        }

        // Pagination parameters
        const page = parseInt(req.query.page, 3) || 1;
        const limit = parseInt(req.query.limit, 3) || 3;
        const offset = (page - 1) * limit;

        // Query to get total number of feedbacks
        const totalQuery = 'SELECT COUNT(*) as total FROM feedback';
        db.query(totalQuery, (err, totalResult) => {
            if (err) {
                console.error('Error fetching total count:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            const total = totalResult[0].total;

            // Query to get feedbacks with pagination
            const feedbackQuery = `
            SELECT 
                f.idfeedback, 
                f.feedback_message, 
                f.rating, 
                f.client_id,
                f.employe_id,
                f.admin_id,
                f.date_created, 
                f.feedback_category, 
                f.parent_id,
                fr.is_like AS user_reaction,  -- Get the current user's reaction
                COALESCE(
                    CONCAT(a.nom_admin, ' ', a.prenom_admin),
                    CONCAT(e.nom_employe, ' ', e.prenom_employe),
                    CONCAT(c.nom_client, ' ', c.prenom_client)
                ) AS username,
                -- Count likes and dislikes
                (SELECT COUNT(*) FROM feedback_reactions WHERE feedback_id = f.idfeedback AND is_like = 1) AS likes_count,
                (SELECT COUNT(*) FROM feedback_reactions WHERE feedback_id = f.idfeedback AND is_like = 0) AS dislikes_count
            FROM 
                feedback f
            LEFT JOIN 
                feedback_reactions fr ON fr.feedback_id = f.idfeedback AND ${reactionJoinCondition} -- Filter for current user reaction
            LEFT JOIN 
                admin a ON f.admin_id = a.idadmin
            LEFT JOIN 
                employe e ON f.employe_id = e.idemploye
            LEFT JOIN 
                client c ON f.client_id = c.idclient
            ORDER BY 
                f.date_created DESC
            LIMIT ? OFFSET ?;
            `;

            db.query(feedbackQuery, [limit, offset], (err, feedbackResult) => {
                if (err) {
                    console.error('Error fetching feedback:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.json({
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    feedbacks: feedbackResult
                });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Get feedback by ID
const getFeedbackById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { idfeedback } = req.params;
        if (!idfeedback) {
            return res.status(400).json({ message: 'Feedback ID is required' });
        }

        const query = 'SELECT * FROM feedback WHERE idfeedback = ?';
        db.query(query, [idfeedback], (err, result) => {
            if (err) {
                console.error('Error fetching feedback:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Feedback not found" });
            }

            res.json(result[0]);
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create new feedback
const createFeedback = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Extract feedback data from the request body
        const { feedback_message, rating, feedback_category, parent_id = null } = req.body;

        // Check role and get the user ID based on their role
        const userId = authResult.decode.id;

        const query = `
            INSERT INTO feedback (feedback_message, rating, feedback_category, date_created, client_id, employe_id, admin_id, parent_id)
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)
        `;
        const params = [
            feedback_message,
            rating,
            feedback_category,
            authResult.decode.role === 'client' ? userId : null,
            authResult.decode.role === 'employe' ? userId : null,
            authResult.decode.role === 'admin' ? userId : null,
            parent_id // This will be null for top-level feedback and an ID for replies
        ];

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Error creating feedback:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            res.status(201).json({ message: "Feedback created successfully", idfeedback: result.insertId });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const updateFeedback = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { idfeedback } = req.params;
        const { feedback_message, rating, feedback_category } = req.body;

        console.log('Attempting to update feedback with ID:', idfeedback);
        console.log('Update data:', { feedback_message, rating, feedback_category });

        // Check if the feedback exists and belongs to the user or admin
        const checkFeedbackQuery = `SELECT * FROM feedback WHERE idfeedback = ? AND (client_id = ? OR employe_id = ? OR admin_id = ?)`;
        const checkFeedbackParams = [
            idfeedback,
            authResult.decode.id,
            authResult.decode.id,
            authResult.decode.id
        ];

        db.query(checkFeedbackQuery, checkFeedbackParams, (err, feedback) => {
            if (err) {
                console.error('Error checking feedback:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (feedback.length === 0) {
                return res.status(404).json({ message: "Feedback not found or you do not have permission to update it" });
            }

            // If feedback exists and user has permission to update it
            const query = `
                UPDATE feedback
                SET feedback_message = ?, rating = ?, feedback_category = ?
                WHERE idfeedback = ?
            `;
            const params = [feedback_message, rating, feedback_category, idfeedback];

            console.log('Executing update query with params:', params);

            db.query(query, params, (err, result) => {
                if (err) {
                    console.error('Error updating feedback:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Feedback not found or you do not have permission to update it" });
                }

                res.json({ message: "Feedback updated successfully" });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { idfeedback } = req.params;

        // Check if the feedback exists and belongs to the user or admin
        const checkFeedbackQuery = `SELECT * FROM feedback WHERE idfeedback = ? AND (client_id = ? OR employe_id = ? OR admin_id = ?)`;
        const checkFeedbackParams = [
            idfeedback,
            authResult.decode.id,
            authResult.decode.id,
            authResult.decode.id
        ];

        db.query(checkFeedbackQuery, checkFeedbackParams, (err, feedback) => {
            if (err) {
                console.error('Error checking feedback:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (feedback.length === 0) {
                return res.status(404).json({ message: "Feedback not found or you do not have permission to delete it" });
            }

            // If feedback exists and user has permission to delete it
            const deleteQuery = 'DELETE FROM feedback WHERE idfeedback = ?';
            db.query(deleteQuery, [idfeedback], (err, result) => {
                if (err) {
                    console.error('Error deleting feedback:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Feedback not found or you do not have permission to delete it" });
                }

                res.json({ message: "Feedback deleted successfully" });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};



/*
const Like_Dislike_Feedback = async (req, res) => {
    try {
        console.log("Starting Like/Dislike operation...");

        // Authorization check
        const authResult = await isAuthorize(req, res); // Use `await` for async function
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("User authorized, proceeding with feedback update...");

        const userId = authResult.decode.id; // Assuming userId is determined by JWT
        const { feedback_id, is_like } = req.body;

        // Directly update the feedback like/dislike status
        const updateQuery = `
            UPDATE feedback 
            SET is_like = ? 
            WHERE idfeedback = ? 
            AND (client_id = ? OR employe_id = ? OR admin_id = ?)`;

        console.log("Updating feedback is_like...");

        // Use promise-based query execution instead of callbacks
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [is_like ? 1 : 0, feedback_id, userId, userId, userId], (err) => {
                if (err) {
                    console.error('Error updating feedback:', err);
                    return reject(err);
                }
                console.log("Like/Dislike updated.");
                resolve();
            });
        });

        // Fetch updated like/dislike counts using promises
        const likes = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS likes_count FROM feedback WHERE idfeedback = ? AND is_like = 1', [feedback_id], (err, result) => {
                if (err) {
                    console.error('Error fetching likes:', err);
                    return reject(err);
                }
                resolve(result[0].likes_count);
            });
        });

        const dislikes = await new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) AS dislikes_count FROM feedback WHERE idfeedback = ? AND is_like = 0', [feedback_id], (err, result) => {
                if (err) {
                    console.error('Error fetching dislikes:', err);
                    return reject(err);
                }
                resolve(result[0].dislikes_count);
            });
        });

        console.log("Counts fetched successfully, sending response...");

        // Respond with updated like/dislike counts
        res.json({
            success: true,
            likes,
            dislikes
        });

    } catch (error) {
        console.error('Error updating like/dislike:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const Like_Dislike_Feedback = async (req, res) => {
    try {
        console.log("Starting Like/Dislike operation...");

        // Authorization check
        const authResult = await isAuthorize(req, res); // Use `await` for async function
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;  // 'client', 'employee', or 'admin'

        console.log("Received from React:", req.body);
        const { feedback_id, is_like } = req.body;

        console.log("User authorized, checking feedback entry...");

        // Convert `is_like` to boolean compatible with MySQL (1 for true, 0 for false)
        const likeValue = is_like ? 1 : 0;

        // Check if the feedback exists
        const feedbackQuery = 'SELECT * FROM feedback WHERE idfeedback = ?';
        db.query(feedbackQuery, [feedback_id], (err, feedbackResult) => {
            if (err) {
                console.error('Error fetching feedback:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (feedbackResult.length === 0) {
                console.log("Feedback not found.");
                return res.status(404).json({ message: "Feedback not found" });
            }

            console.log("Feedback entry found, updating like/dislike...");

            // Update the existing feedback with like/dislike
            const updateQuery = `
            UPDATE feedback 
            SET is_like = ? 
            WHERE idfeedback = ?
        `;


            db.query(updateQuery, [likeValue, feedback_id, userId, userId, userId], (err, updateResult) => {
                if (err) {
                    console.error('Error updating feedback:', err);
                    return res.status(500).json({ message: "Internal server error" });
                }

                // Log the number of affected rows
                console.log("Update result:", updateResult);

                if (updateResult.affectedRows === 0) {
                    console.log("No rows were updated. Check if the feedback_id and userId exist.");
                    return res.status(404).json({ message: "No rows updated" });
                }

                console.log("Like/Dislike updated, fetching counts...");


                // Fetch the count of likes
                db.query('SELECT COUNT(*) AS likes_count FROM feedback WHERE idfeedback = ? AND is_like = 1', [feedback_id], (err, likesResult) => {
                    if (err) {
                        console.error('Error fetching likes:', err);
                        return res.status(500).json({ message: "Internal server error" });
                    }
                    console.log("Fetched likes_count:", likesResult[0].likes_count); // Log the likes count


                    // Fetch the count of dislikes
                    db.query('SELECT COUNT(*) AS dislikes_count FROM feedback WHERE idfeedback = ? AND is_like = 0', [feedback_id], (err, dislikesResult) => {
                        if (err) {
                            console.error('Error fetching dislikes:', err);
                            return res.status(500).json({ message: "Internal server error" });
                        }
                        console.log("Fetched dislikes_count:", dislikesResult[0].dislikes_count); // Log the dislikes count

                        console.log("Counts fetched successfully, sending response...");

                        // Respond with updated like/dislike counts
                        res.json({
                            success: true,
                            likes: likesResult[0].likes_count,
                            dislikes: dislikesResult[0].dislikes_count
                        });
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error updating like/dislike:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

*/


const Like_Dislike_Feedback = async (req, res) => {
    try {
        console.log("Starting Like/Dislike operation...");

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;  // 'client', 'employee', or 'admin'
        const { feedback_id, is_like } = req.body;

        // Determine the user column to update based on role
        let columnName = '';
        if (userRole === 'client') {
            columnName = 'client_id';
        } else if (userRole === 'employe') {
            columnName = 'employe_id';
        } else if (userRole === 'admin') {
            columnName = 'admin_id';
        }

        // Check if the user already has a reaction for this feedback
        const checkQuery = `
            SELECT * FROM feedback_reactions 
            WHERE feedback_id = ? AND ${columnName} = ?
        `;

        db.query(checkQuery, [feedback_id, userId], (err, result) => {
            if (err) {
                console.error('Error checking reaction:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (result.length > 0) {
                if (is_like === null) {
                    // User wants to remove their reaction, so delete it
                    const deleteQuery = `
                        DELETE FROM feedback_reactions 
                        WHERE feedback_id = ? AND ${columnName} = ?
                    `;
                    db.query(deleteQuery, [feedback_id, userId], (err, deleteResult) => {
                        if (err) {
                            console.error('Error deleting reaction:', err);
                            return res.status(500).json({ message: "Internal server error" });
                        }

                        console.log("Reaction deleted, fetching like/dislike counts...");

                        // Fetch updated like/dislike counts
                        fetchLikeDislikeCounts(feedback_id, res);
                    });
                } else {
                    // Reaction exists, update it
                    const updateQuery = `
                        UPDATE feedback_reactions 
                        SET is_like = ? 
                        WHERE feedback_id = ? AND ${columnName} = ?
                    `;
                    db.query(updateQuery, [is_like ? 1 : 0, feedback_id, userId], (err, updateResult) => {
                        if (err) {
                            console.error('Error updating reaction:', err);
                            return res.status(500).json({ message: "Internal server error" });
                        }

                        console.log("Reaction updated, fetching like/dislike counts...");

                        // Fetch updated like/dislike counts
                        fetchLikeDislikeCounts(feedback_id, res);
                    });
                }
            } else {
                if (is_like !== null) {
                    // Reaction does not exist, insert a new one
                    const insertQuery = `
                        INSERT INTO feedback_reactions (feedback_id, ${columnName}, is_like)
                        VALUES (?, ?, ?)
                    `;
                    db.query(insertQuery, [feedback_id, userId, is_like ? 1 : 0], (err, insertResult) => {
                        if (err) {
                            console.error('Error inserting reaction:', err);
                            return res.status(500).json({ message: "Internal server error" });
                        }

                        console.log("Reaction inserted, fetching like/dislike counts...");

                        // Fetch updated like/dislike counts
                        fetchLikeDislikeCounts(feedback_id, res);
                    });
                } else {
                    // No need to insert or delete, since is_like is null
                    res.json({
                        success: true,
                        message: "No action taken as is_like is null"
                    });
                }
            }
        });

    } catch (error) {
        console.error('Error updating like/dislike:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Helper function to fetch like/dislike counts
const fetchLikeDislikeCounts = (feedback_id, res) => {
    const likesQuery = 'SELECT COUNT(*) AS likes_count FROM feedback_reactions WHERE feedback_id = ? AND is_like = 1';
    const dislikesQuery = 'SELECT COUNT(*) AS dislikes_count FROM feedback_reactions WHERE feedback_id = ? AND is_like = 0';

    db.query(likesQuery, [feedback_id], (err, likesResult) => {
        if (err) {
            console.error('Error fetching likes count:', err);
            return res.status(500).json({ message: "Internal server error" });
        }

        db.query(dislikesQuery, [feedback_id], (err, dislikesResult) => {
            if (err) {
                console.error('Error fetching dislikes count:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            // Send back the updated counts
            res.json({
                success: true,
                likes: likesResult[0].likes_count,
                dislikes: dislikesResult[0].dislikes_count
            });
        });
    });
};





module.exports = {
    getAllFeedback,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback, Like_Dislike_Feedback
};
