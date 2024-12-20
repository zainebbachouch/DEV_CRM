const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require("./routes/userRoute");
const categorieRoute = require("./routes/categorieRoute");
const productRoute = require("./routes/productRoute");
const baskeRoute = require("./routes/baskeRoute");
const commandsRoute = require("./routes/commandsRoute");
const factureRoute = require("./routes/factureRoute");
const autorisationRoute = require("./routes/autorisationRoute");
const messengerRoute = require("./routes/messengerRoutes");
const chatbotRoute = require("./routes/chatbotRoute");

const taskRoute = require("./routes/taskRoute");
const feedbackRoute = require("./routes/feedbackRoute")
const heroRoutes = require("./routes/homeRoute"); // Import your route

const http = require('http');
const socketIo = require('socket.io');
const db = require('./config/dbConnection');
const { getInformationOfRole } = require('./controllers/callback');
const { createProduct } = require('./controllers/productController');
const { passCommand } = require('./controllers/basketController');
const { updateCommandStatus } = require('./controllers/commandsContoller')
const { createTask, updateTaskStatus } = require('./controllers/taskController');




const cookieParser = require("cookie-parser");
const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'], // Limit to specific ports or domains
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Refresh-Token'],
  }
});


app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  //origin: "http://127.0.0.1:3000",
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Refresh-Token'],
  optionsSuccessStatus: 200,
  // add this line
  // exposeHeaders: ['Set-Cookie'],
  //debug: true,*/

}));



app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`Response sent: ${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

app.use('/api', userRoute);
app.use('/api', categorieRoute);
app.use('/api', productRoute);
app.use('/api', baskeRoute);
app.use('/api', commandsRoute);
app.use('/api', factureRoute);
app.use('/api', autorisationRoute);
app.use('/api', messengerRoute);
app.use('/api', taskRoute);
app.use('/api', feedbackRoute);
app.use('/api', heroRoutes); // Make sure your API routes are prefixed with /api
// Pass socket.io instance to the chatbot routes
app.use('/api', chatbotRoute(io));



app.get('/api/searchUsers/:searchTerm', async (req, res) => {
  const { searchTerm } = req.params;

  try {
    const query = `
      SELECT idemploye AS userId, 'employe' AS role, nom_employe AS name, prenom_employe AS prenom, photo_employe AS photo 
      FROM employe 
      WHERE nom_employe LIKE ? OR prenom_employe LIKE ?
      UNION
      SELECT idadmin AS userId, 'admin' AS role, nom_admin AS name, prenom_admin AS prenom, photo_admin AS photo 
      FROM admin 
      WHERE nom_admin LIKE ? OR prenom_admin LIKE ?
      UNION
      SELECT idclient AS userId, 'client' AS role, nom_client AS name, prenom_client AS prenom, photo_client AS photo 
      FROM client 
      WHERE nom_client LIKE ? OR prenom_client LIKE ?
    `;

    const values = Array(6).fill(`%${searchTerm}%`);

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error in searchUsers:', err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).json({ users: results });
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/listMessages', (req, res) => {
  const { sender_id, receiver_id } = req.query;
  const query = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY timestamp ASC`;

  db.query(query, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      res.status(500).send('Error fetching messages');
      return;
    }
    res.status(200).json({ messages: results });
    console.log(results);
  });
});



app.get('/api/conversations', (req, res) => {
  const userId = req.query.userId;
  const query = `
    SELECT 
        CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
        END AS id,
        CASE 
            WHEN sender_id = ? THEN rolereciever 
            ELSE rolesender 
        END AS role,
        COALESCE(c.nom_client, e.nom_employe, a.nom_admin) AS name,
        COALESCE(c.prenom_client, e.prenom_employe, a.prenom_admin) AS prenom,
        COALESCE(c.photo_client, e.photo_employe, a.photo_admin) AS photo,
        MAX(m.message) AS message, -- Get the latest message
        MAX(m.timestamp) AS timestamp -- Get the latest timestamp
    FROM messages m
    LEFT JOIN client c ON c.idclient = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
    LEFT JOIN employe e ON e.idemploye = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
    LEFT JOIN admin a ON a.idadmin = CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
    WHERE sender_id = ? OR receiver_id = ?
    GROUP BY id, role, name, prenom, photo
    ORDER BY timestamp DESC;
  `;

  db.query(
    query,
    [userId, userId, userId, userId, userId, userId, userId],
    (err, results) => {
      if (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).send('Error fetching conversations');
        return;
      }
      res.status(200).json({ conversations: results });
    }
  );
});




app.get('/api/allUsers', (req, res) => {
  const query = `
    SELECT idadmin AS userId, 'admin' AS role, nom_admin AS name, prenom_admin AS prenom, photo_admin AS photo FROM admin
    UNION
    SELECT idemploye AS userId, 'employe' AS role, nom_employe AS name, prenom_employe AS prenom, photo_employe AS photo FROM employe
    UNION
    SELECT idclient AS userId, 'client' AS role, nom_client AS name, prenom_client AS prenom, photo_client AS photo FROM client;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
      return;
    }
    res.status(200).json({ users: results });
  });
});




const userSocketMap = {};

io.on('connection', (socket) => {
  console.log('New client connected usiiiiiiiiiiiiiing socket ');

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on('sendMessage', async (message) => {
    console.log("messsssssssssssssssssage", message)
    const query = `INSERT INTO messages (sender_id, rolesender, receiver_id, rolereciever, message) VALUES (?, ?, ?, ?, ?)`;

    try {
      await db.query(query, [message.sender_id, message.rolesender, message.receiver_id, message.rolereciever, message.message]);
      console.log('Message inserted into database:', message);

      const senderInfo = await getInformationOfRole(message.rolesender, message.sender_id);
      const receiverInfo = await getInformationOfRole(message.rolereciever, message.receiver_id);

      if (senderInfo && receiverInfo) {
        let senderName;
        if (message.rolesender === 'admin') {
          senderName = `${senderInfo.nom_admin} ${senderInfo.prenom_admin} ${senderInfo.photo_admin}`;
        } else if (message.rolesender === 'client') {
          senderName = `${senderInfo.nom_client} ${senderInfo.prenom_client} ${senderInfo.photo_client}`;
        } else if (message.rolesender === 'employe') {
          senderName = `${senderInfo.nom_employe} ${senderInfo.prenom_employe} ${senderInfo.photo_employe}`;
        }

        const notificationMessage = `New message from ${senderName} (${message.sender_id}) to ${message.receiver_id}: ${message.message}`;

        const email_destinataire = receiverInfo[`email_${message.rolereciever}`];
        await saveNotifications(email_destinataire, notificationMessage);

        const receiverSocketId = userSocketMap[message.receiver_id];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
            sender_id: message.sender_id
          });
        }
      }

      const emittedMessage = { ...message, timestamp: new Date().toISOString() };
      console.log(emittedMessage)
      io.emit('receiveMessage', emittedMessage);

    } catch (err) {
      console.error('Error inserting message or saving notification:', err);
    }
  });
  /*
    const saveNotifications = async (email_destinataires, message, emailsender) => {
      try {
        const sqlQuery = 'INSERT INTO notification (email_destinataire, message, date, email_sender,seen ,unreadCount ) VALUES (?, ?, NOW(), ?,?,1)';
        const results = [];
        //const updateQuery = 'UPDATE notification SET unreadCount = unreadCount + 1 WHERE email_destinataire = ?';
  
        for (const email of email_destinataires) {
          // Skip inserting if email is same as sender's email
          if (email === emailsender) {
            continue;
          }
  
          const result = await db.query(sqlQuery, [email, message, emailsender, true]);
          console.log("Notification enregistrée avec succès pour:", email);
          results.push(result);
  
          //  const updateResult = await db.query(updateQuery, [email]);
          // console.log(`Unread count mis à jour pour ${email}:`, updateResult);
        }
  
        return results;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la notification:", error);
        throw error;
      }
    };
  */


  const saveNotifications = async (email_destinataires, message, emailsender) => {
    try {
      const sqlQuery = 'INSERT INTO notification (email_destinataire, message, date, email_sender, seen, unreadCount) VALUES (?, ?, NOW(), ?,?, 1)';
      const results = [];

      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      for (const email of email_destinataires) {
        // Skip if email is the same as sender's email
        if (email === emailsender) {
          console.log(`Skipping notification for sender's email: ${email}`);
          continue;
        }

        // Validate email format
        if (!isValidEmail(email)) {
          console.log(`Invalid email address: ${email}`);
          continue;
        }

        // Insert notification
        const result = await db.query(sqlQuery, [email, message, emailsender, false]);
        console.log(`Notification saved successfully for: ${email}`);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error("Error saving notification:", error);
      throw error;
    }
  };



  var senderEmail, iduser, selectedEmployees;


  socket.on('newProduct', async (product) => {
    console.log('New product added:', product);

    senderEmail = product.email;
    iduser = product.userid;


    try {
      const req = { body: product };
      await createProduct(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
          }
        }),
      });

      const queryPromise = (sql) => {
        return new Promise((resolve, reject) => {
          db.query(sql, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      };

      const [admins, employees, clients] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe'),
        queryPromise('SELECT * FROM client')
      ]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);
      console.log('Clients:', clients);

      const notificationMessage = `A new product has been added: ${product.nom_produit}`;

      const adminEmails = admins
        .filter(admin => admin.idadmin !== iduser)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage, senderEmail);

      const employeeEmails = employees
        .filter(employee => employee.idemploye !== iduser)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage, senderEmail);

      const clientEmails = clients.map(client => client.email_client);
      await saveNotifications(clientEmails, notificationMessage, senderEmail);

      for (const userId in userSocketMap) {
        if (userId !== iduser) {
          io.to(userSocketMap[userId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
            product_id: product.id
          });
        }
      }
    } catch (error) {
      console.error('Error creating product in index.js:', error);
    }
  });




  socket.on('passCommand', async (commandData) => {
    console.log('passCommand received', commandData);
    senderEmail = commandData.email;
    iduser = commandData.userid;


    try {
      const req = { body: commandData };
      await passCommand(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
          }
        }),
      });

      const queryPromise = (sql) => {
        return new Promise((resolve, reject) => {
          db.query(sql, (error, results) => {
            if (error) reject(error);
            else resolve(results);
          });
        });
      };

      const [admins, employees] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe')
      ]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);

      const notificationMessage = `A new passCommand has been added by client`;

      const adminEmails = admins
        .filter(admin => admin.idadmin !== iduser)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage, senderEmail);

      const employeeEmails = employees
        .filter(employee => employee.idemploye !== iduser)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage, senderEmail);

      for (const userId in userSocketMap) {
        if (userId !== iduser) {
          io.to(userSocketMap[userId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error in passCommand in index.js:', error);
    }
  });

  socket.on('updateCommandStatus', async (commandData) => {
    console.log('updateCommandStatus received', commandData);
    senderEmail = commandData.email;
    iduser = commandData.userid;


    try {
      const req = { body: commandData };
      await updateCommandStatus(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
          }
        }),
      });

      const queryPromise = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
          });
        });
      };

      const [admins, employees, relatedClients] = await Promise.all([
        queryPromise('SELECT * FROM admin'),
        queryPromise('SELECT * FROM employe'),
        queryPromise('SELECT client.email_client FROM client JOIN commande ON client.idclient = commande.client_idclient WHERE commande.idcommande = ?', [commandData.idcommande])
      ]);

      console.log('Admins:', admins);
      console.log('Employees:', employees);
      console.log('Related Clients:', relatedClients);

      const notificationMessage = `A new command status update has been made`;

      const adminEmails = admins
        .filter(admin => admin.idadmin !== iduser)
        .map(admin => admin.email_admin);
      await saveNotifications(adminEmails, notificationMessage, senderEmail);

      const employeeEmails = employees
        .filter(employee => employee.idemploye !== iduser)
        .map(employee => employee.email_employe);
      await saveNotifications(employeeEmails, notificationMessage, senderEmail);

      const clientEmails = relatedClients.map(client => client.email_client);
      await saveNotifications(clientEmails, notificationMessage, senderEmail);

      for (const userId in userSocketMap) {
        if (userId !== iduser) {
          io.to(userSocketMap[userId]).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error in updateCommandStatus in index.js:', error);
    }
  });


  socket.on('createTask', async (data) => {
    console.log('createTask received', data);
    senderEmail = data.email;
    iduser = data.userid;

    selectedEmployees = data.selectedEmployees;


    try {
      const req = { body: data };
      await createTask(req, {
        status: (code) => ({
          json: (data) => {
            console.log(`Response sent: ${code} ${JSON.stringify(data)}`);
          }
        }),
      });

      const queryPromise = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
          });
        });
      };

      const employees = await queryPromise('SELECT * FROM employe');
      console.log('Employees:', employees);

      const notificationMessage = `A new task has been assigned to you`;

      const employeeEmails = employees
        .filter(employee => selectedEmployees.includes(employee.idemploye) && employee.idemploye !== iduser)
        .map(employee => employee.email_employe);

      await saveNotifications(employeeEmails, notificationMessage, senderEmail);

      for (const userId of selectedEmployees) {
        const receiverSocketId = userSocketMap[userId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveNotification', {
            message: notificationMessage,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error in createTask in index.js:', error);
    }
  });

  socket.on('TaskifDone', async (putData) => {
    console.log('TaskifDone received', putData);
    const { email, userid, token, ...taskData } = putData;
    const taskId = putData.taskId; // Assuming taskId is passed with the data

    try {
      // Prepare request object
      const req = { body: taskData, headers: { authorization: `Bearer ${token}` }, params: { id: taskId } };

      // Call updateTaskStatus and extract the response
      const response = await new Promise((resolve) => {
        updateTaskStatus(req, {
          status: () => ({
            json: (data) => resolve(data)
          }),
        });
      });

      // Extract NameOfSender from response
      const nameOfSender = response?.nameOfSender || 'Unknown Sender'; // Default value if not available

      // Define a query promise function
      const queryPromise = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
          });
        });
      };

      // Get all admin emails
      const admins = await queryPromise('SELECT * FROM admin');
      console.log('admins:', admins);

      // Notification message
      const notificationMessage = `A task has been completed by ${nameOfSender}`;
      const adminEmails = admins
        .filter(admin => admin.idadmin !== userid)
        .map(admin => admin.email_admin);

      // Save notifications (assuming saveNotifications is defined)
      await saveNotifications(adminEmails, notificationMessage, email);

      // Send notifications via socket to all users except the current user
      for (const userId in userSocketMap) {
        if (userId !== userid) {
          const receiverSocketId = userSocketMap[userId];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receiveNotification', {
              message: notificationMessage,
              timestamp: new Date().toISOString(),
              taskId: taskId
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in TaskifDone event:', error);
    }
  });







  app.use((error) => {
    console.log('This is the rejected field ->', error.field);
  });
  socket.on('disconnect', () => {
    for (let userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
    console.log('Client disconnected');
  });
});



const PORT = process.env.PORT || 4000; // Default HTTP server port
const SOCKET_PORT = process.env.SOCKET || 8000; // Default Socket server port

//let httpServer; // Declare httpServer globally for export
//let socketServer; // Declare socketServer globally for export

const isTestEnv = process.env.NODE_ENV === 'test'; // Detect if running in test environment

// Start servers only if not in test environment
if (!isTestEnv) {
  app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
  });

  server.listen(SOCKET_PORT, () => {
    console.log(`Socket server running on port ${SOCKET_PORT}`);
  });
}
else {
  console.log('Running in test environment, servers will not auto-start.');
}

module.exports = { app, server }; // Export app, server, and socket.io instance
