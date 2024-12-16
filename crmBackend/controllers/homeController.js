const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken ')



const getAllHeroSections = async (req, res) => {
    try {
        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Role check
        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Query to fetch all hero sections
        const heroQuery = 'SELECT * FROM hero_section';
        db.query(heroQuery, (err, heroResult) => {
            if (err) {
                console.error('Error fetching hero sections:', err);
                return res.status(500).json({ message: "Internal server error" });
            }
        
            if (heroResult.length === 0) {
                console.warn('No hero section found in the database');
                return res.status(404).json({ message: "No hero section found" });
            }
        
            res.status(200).json({
                heroSections: heroResult
            });
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const updateHeroSection = async (req, res) => {
    try {
        const { id } = req.params; // Hero section ID to update
        const { headline, description, image_url } = req.body;

        // Authorization check
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check role (only admin or employee can update)
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        let adminId = null;
        let employeId = null;

        if (userRole === 'admin') {
            adminId = userId; // Only set admin ID if the user is an admin
        } else if (userRole === 'employe') {
            employeId = userId; // Only set employee ID if the user is an employee
        } else {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Update the hero section
        const updateQuery = `
            UPDATE hero_section
            SET headline = ?, description = ?, image_url = ?, admin_id = ?, employe_id = ?
            WHERE id = ?
        `;
        db.query(updateQuery, [headline, description, image_url, adminId, employeId, id], (err, result) => {
            if (err) {
                console.error('Error updating hero section:', err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Hero section not found" });
            }

            res.json({ message: "Hero section updated successfully" });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getAllStorySections = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') return res.status(401).json({ message: "Unauthorized" });

        const { role } = authResult.decode;
        if (!['admin', 'employe', 'client'].includes(role)) return res.status(403).json({ message: "Insufficient permissions" });

        const storyQuery = 'SELECT * FROM story_section';
        db.query(storyQuery, (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            if (result.length === 0) return res.status(404).json({ message: "No story section found" });

            res.status(200).json({ storySections: result });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};



const updateStorySection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, paragraph, image_url } = req.body;

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') return res.status(401).json({ message: "Unauthorized" });

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        let adminId = null, employeId = null;

        if (userRole === 'admin') adminId = userId;
        else if (userRole === 'employe') employeId = userId;
        else return res.status(403).json({ message: "Insufficient permissions" });

        const updateQuery = `
            UPDATE story_section
            SET title = ?, paragraph = ?, image_url = ?, admin_id = ?, employe_id = ?
            WHERE id = ?;
        `;
        db.query(updateQuery, [title, paragraph, image_url, adminId, employeId, id], (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Story section not found" });

            res.json({ message: "Story section updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fetch all responsible cards
const getAllResponsibleCards = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const query = 'SELECT * FROM responsible_section';
        db.query(query, (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            if (result.length === 0) return res.status(404).json({ message: "No responsible card found" });

            res.status(200).json({ responsibleCards: result });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add new responsible card
const createResponsibleCard = async (req, res) => {
    try {
        const { responsible_departemnt, responsible_name, description, image_url } = req.body;
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') return res.status(401).json({ message: "Unauthorized" });

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        let adminId = null, employeId = null;

        if (userRole === 'admin') adminId = userId;
        else if (userRole === 'employe') employeId = userId;
        else return res.status(403).json({ message: "Insufficient permissions" });

        const insertQuery = `
            INSERT INTO responsible_section (responsible_departemnt, responsible_name, description, image_url, admin_id, employe_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [responsible_departemnt, responsible_name, description, image_url, adminId, employeId], (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });

            res.status(201).json({ message: "Responsible card created successfully", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update responsible card
const updateResponsibleCard = async (req, res) => {
    try {
        const { id } = req.params;
        const { responsible_departemnt, responsible_name, description, image_url } = req.body;

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') return res.status(401).json({ message: "Unauthorized" });

        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        let adminId = null, employeId = null;

        if (userRole === 'admin') adminId = userId;
        else if (userRole === 'employe') employeId = userId;
        else return res.status(403).json({ message: "Insufficient permissions" });

        const updateQuery = `
            UPDATE responsible_section
            SET responsible_departemnt = ?, responsible_name = ?, description = ?, image_url = ?, admin_id = ?, employe_id = ?
            WHERE id = ?
        `;
        db.query(updateQuery, [responsible_departemnt, responsible_name, description, image_url, adminId, employeId, id], (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Responsible card not found" });

            res.json({ message: "Responsible card updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete responsible card
const deleteResponsibleCard = async (req, res) => {
    try {
        const { id } = req.params;

        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') return res.status(401).json({ message: "Unauthorized" });

        const deleteQuery = 'DELETE FROM responsible_section WHERE id = ?';
        db.query(deleteQuery, [id], (err, result) => {
            if (err) return res.status(500).json({ message: "Internal server error" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Responsible card not found" });

            res.json({ message: "Responsible card deleted successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {getAllHeroSections,updateHeroSection,getAllStorySections,updateStorySection,
    getAllResponsibleCards,
    createResponsibleCard,
    updateResponsibleCard,
    deleteResponsibleCard
};