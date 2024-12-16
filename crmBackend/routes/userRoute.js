const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const multer = require('multer');
const path = require('path');


// Route pour demander un code de réinitialisation de mot de passe
router.post('/forgot-password', userController.forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', userController.resetPassword);


router.post('/registerUser', userController.registerUser);



//authentificatin 
router.post('/login', userController.loginUser);
router.post('/registerA', userController.registerA);


router.get('/getUserById/:id', userController.getUserById);

//recupere when role athorized
router.get('/athorizedadmin', userController.listAdminAuthorized);
router.get('/clientbyid/:id', userController.listClientAuthorized);
router.get('/employebyid/:id', userController.listEmployeAuthorized);


//recupere by id 
router.get('/admin/:id', userController.getAdminInformation);
router.get('/client/:id', userController.getClientInformation);
router.get('/employe/:id', userController.getEmployeInformation);


// update by id by photo also 


// Configure Multer storage and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../document/uploads'); // Set the directory for file uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique file name
    }
});

const upload = multer({ storage: storage });

router.put('/updateadmin/:id', (req, res) => { upload.single('photo_admin'), userController.updateAdminInformation(req, res) });
router.put('/updateclient/:id', (req, res) => { upload.single('photo_client'), userController.updateClientInformation(req, res) });
router.put('/updateemploye/:id', (req, res) => { upload.single('photo_employe'); userController.updateEmployeInformation(req, res) });

//list for adminsration
router.get('/employees', userController.listEmployees);
router.get('/clients', userController.listClients);

//update   for adminsration

router.put('/updateEmployeeStatus/:id', userController.updateEmployeeStatus);
router.put('/updateClientStatus/:id', userController.updateClientStatus);

//delete  for adminsration
router.delete('/employees/:id', userController.deleteEmployee);
router.delete('/deleteClient/:id', userController.deleteClient);



/*envoie mail
router.post('/sendMailEmploye', userController.sendMailEmploye)
router.get('/listEmails', userController.listEmails)
*/
module.exports = router;