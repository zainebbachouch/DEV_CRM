const express = require("express");
const homeController = require("../controllers/homeController");
const router = express.Router();
const multer = require('multer');

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

router.get('/allhero_section', homeController.getAllHeroSections);

router.put('/updatehero_section/:id', (req, res) => { upload.single('image_url'), homeController.updateHeroSection(req, res) });
// Define your routes
router.get('/allstory_section', homeController.getAllStorySections);
router.put('/updatestory_section/:id', homeController.updateStorySection);




// Routes for Responsible Cards
router.get('/responsible_cards', homeController.getAllResponsibleCards);
router.post('/responsible_card', upload.single('image_url'), homeController.createResponsibleCard);
router.put('/responsible_card/:id', upload.single('image_url'), homeController.updateResponsibleCard);
router.delete('/responsible_card/:id', homeController.deleteResponsibleCard);


module.exports = router;
