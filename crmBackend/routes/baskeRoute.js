const express = require("express");
const basketController = require("../controllers/basketController");
const router = express.Router();

router.get('/getProductsInCart', basketController.getProductsInCart);
router.post('/AddtoCart', basketController.AddtoCart);

router.post('/decreaseProductQuantity', basketController.decreaseProductQuantity);
router.post('/increaseProductQuantity', basketController.increaseProductQuantity);


router.post('/completeCommand', basketController.completeCommand);
router.put('/passCommand',basketController.passCommand);

module.exports = router;