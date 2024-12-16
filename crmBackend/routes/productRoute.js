const express = require("express");
const productController = require("../controllers/productController");
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

router.put('/updateProduct/:id', (req, res) => { upload.single('photo_produit'), productController.updateProduct(req, res) });
router.post('/createProduct', (req, res) => { upload.single('photo_produit'), productController.createProduct(req, res) });


router.get('/getProductById/:produitId', productController.getProductById);
router.get('/getAllProducts', productController.getAllProducts);
router.delete('/deleteProduct/:id', productController.deleteProduct);
router.get('/search/:searchTerm', productController.searchProducts);


router.get('/total-products-sold', productController.getTotalProductsSold);

router.get('/getProductQuantities', productController.getProductQuantities)
router.post('/predict_sales', productController.getFutureSellingOfProdut)
router.post('/get-existing-data', productController.getProductQuantities)



router.get('/average-sales-price', productController.getAverageSalesPrice);
router.get('/top-selling-products', productController.getTopSellingProducts);
router.get('/sales-trends', productController.getSalesTrends);
router.get('/unpaid-products', productController.getUnpaidProducts);






module.exports = router;
