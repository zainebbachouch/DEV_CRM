const db = require("../config/dbConnection");
const { isAuthorize } = require('../services/validateToken')
const { saveToHistory } = require('./callback');





const createTask = async (req, res) => {

    try {
        const { idEmployes, title, messageTache, deadline, statut, priorite } = req.body;

        // Validate status and priority
        /* if (!['To-Do', 'In-Progress', 'Done'].includes(statut)) {
             return res.status(400).json({ message: "Invalid status" });
         }
         if (!['urgence', 'importance', 'routine'].includes(priorite)) {
             return res.status(400).json({ message: "Invalid priority" });
         }
         */
        // Log the received data
        console.log('Received data:', req.body);

        if (!idEmployes || !title || !messageTache || !deadline || !statut || !priorite) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const query = 'INSERT INTO tache (title, messageTache, deadline, statut, priorite) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [title, messageTache, deadline, statut, priorite], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: err.message });
            }
            const taskId = result.insertId;

            // Insert employees for the task
            const tacheEmployeQuery = 'INSERT INTO tache_employe (idTache, idEmploye) VALUES ?';
            const tacheEmployeValues = idEmployes.map(idEmploye => [taskId, idEmploye]);
            db.query(tacheEmployeQuery, [tacheEmployeValues], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: err.message });
                }
                /*  const userId = authResult.decode.id;
                 const userRole = authResult.decode.role;
                 saveToHistory('task created', userId, userRole); */
                res.status(201).json({ message: 'Tâche créée avec succès', id: taskId, title });


            });
        });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getTaskById = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const query = 'SELECT * FROM tache WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ message: 'Tâche non trouvée' });
            res.status(200).json(result[0]);
        });
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};







const getAllTasks = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        console.log(authResult)
        /* if (authResult.message !== 'authorized') {
             return res.status(401).json({ message: "Unauthorized" });
         } */

        /* if (authResult.message=="Unauthorized") {
            return res.status(403).json({ message: "Insufficient permissions" });
        } */

        const query = `
            SELECT 
              t.id, 
              t.title, 
              t.messageTache, 
              t.deadline, 
              t.statut, 
              t.priorite, 
              t.order, 
              e.photo_employe,
              GROUP_CONCAT(DISTINCT CONCAT(e.nom_employe, ' ', e.prenom_employe) SEPARATOR ', ') AS employe_names
            FROM 
              tache t
            JOIN 
              tache_employe te ON t.id = te.idTache
            JOIN 
              employe e ON te.idEmploye = e.idemploye
            GROUP BY 
              t.id, t.title, t.messageTache, t.deadline, t.statut, t.priorite, t.order, e.photo_employe
            ORDER BY 
              t.priorite DESC, t.deadline ASC;
          `;



        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            console.log(results)

            res.status(200).json(results);
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};







const updateTask = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const { messageTache, title, deadline, statut, priorite, order, idEmployes } = req.body;

        if (!['To-Do', 'In-Progress', 'Done'].includes(statut)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if (!['urgence', 'importance', 'routine'].includes(priorite)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        const updateQuery = 'UPDATE tache SET messageTache = ?, title=? , deadline = ?, statut = ?, priorite = ?, `order` = ? WHERE id = ?';
        db.query(updateQuery, [messageTache, title, deadline, statut, priorite, order, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Delete old employee assignments
            const deleteQuery = 'DELETE FROM tache_employe WHERE idTache = ?';
            db.query(deleteQuery, [id], (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Insert new employee assignments
                const tacheEmployeQuery = 'INSERT INTO tache_employe (idTache, idEmploye) VALUES ?';
                const tacheEmployeValues = idEmployes.map(idEmploye => [id, idEmploye]);
                db.query(tacheEmployeQuery, [tacheEmployeValues], (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.status(200).json({ message: 'Task updated successfully' });
                    const userId = authResult.decode.id;
                    const userRole = authResult.decode.role;
                    saveToHistory('task updated', userId, userRole);
                });
            });
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const { messageTache, deadline, statut, priorite, order } = req.body;

        if (!['To-Do', 'In-Progress', 'Done'].includes(statut)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        if (!['urgence', 'importance', 'routine'].includes(priorite)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        const updateQuery = 'UPDATE tache SET messageTache = ?, deadline = ?, statut = ?, priorite = ?, `order` = ? WHERE id = ?';

        // Update the task status and wait for it to complete
        const updateTaskPromise = new Promise((resolve, reject) => {
            db.query(updateQuery, [messageTache, deadline, statut, priorite, order, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        const userId = authResult.decode.id;


        // Fetch the names of employees associated with the task
        const nameQuery = `
            SELECT e.nom_employe, e.prenom_employe
            FROM employe e
            JOIN tache_employe te ON e.idemploye = te.idEmploye
            WHERE te.idTache = ? AND e.idemploye =?;
        `;
        const fetchNamesPromise = new Promise((resolve, reject) => {
            db.query(nameQuery, [id, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Wait for both promises to complete
        const [namesResult] = await Promise.all([updateTaskPromise, fetchNamesPromise]);

        // Generate the names of the employees
        const nameOfSender = namesResult.map(e => `${e.nom_employe} ${e.prenom_employe}`).join(', ');

        // Log the update to history
        const userRole = authResult.decode.role;
        saveToHistory('task updated', userId, userRole);
        console.log('Name of Senderrrrrrrrr:', nameOfSender);

        // Respond with the result
        res.status(200).json({ message: 'Task updated successfully', nameOfSender });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






const updateTasksOrder = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { tasks } = req.body;

        // Ensure tasks is an array
        if (!Array.isArray(tasks)) {
            return res.status(400).json({ message: "Invalid tasks data" });
        }

        const updateOrderPromises = tasks.map((task) => {
            const updateOrderQuery = 'UPDATE tache SET `order` = ? WHERE id = ?';
            return new Promise((resolve, reject) => {
                db.query(updateOrderQuery, [task.order, task.id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
        });

        await Promise.all(updateOrderPromises);

        // Log the update to history
        const userId = authResult.decode.id;
        const userRole = authResult.decode.role;
        saveToHistory('tasks order updated', userId, userRole);

        res.status(200).json({ message: 'Tasks order updated successfully' });
    } catch (error) {
        console.error('Error updating tasks order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const deleteTask = async (req, res) => {
    try {
        const authResult = await isAuthorize(req, res);
        if (authResult.message !== 'authorized') {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (authResult.decode.role !== 'admin' && authResult.decode.role !== 'employe') {
            return res.status(403).json({ message: "Insufficient permissions" });
        }

        const { id } = req.params;
        const query = 'DELETE FROM tache WHERE id = ?';
        db.query(query, [id], (err) => {
            if (err) {
                console.error('Error deleting task:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Tâche supprimée avec succès' });
        });

        const userId = authResult.decode.id;
        console.log('Connected user:', userId);
        const userRole = authResult.decode.role;
        saveToHistory('task deleted', userId, userRole);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





// Function to get tasks count by status
const getTasksByStatus = async (req, res) => {
    const { selectedStatus } = req.query;
    const tasksQuery = `
    SELECT statut, COUNT(*) AS count FROM tache GROUP BY statut;

    `;

    try {
        const tasksCountsResult = await new Promise((resolve, reject) => {
            db.query(tasksQuery, [selectedStatus], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // Map the results to a more useful format
        const tasksCounts = {
            toDo: 0,
            inProgress: 0,
            done: 0,
        };

        tasksCountsResult.forEach(row => {
            tasksCounts[row.statut] = row.count;
        });

        res.json(tasksCounts);
    } catch (error) {
        console.error("Error fetching tasks count:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};






module.exports = {
    getTasksByStatus,
    createTask, getAllTasks, getTaskById, updateTask, deleteTask, updateTasksOrder, updateTaskStatus
};
