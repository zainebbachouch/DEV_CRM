const express = require("express");
const categorieController = require("../controllers/categorieController");
const router = express.Router();

router.post('/createCategorie', categorieController.createCategorie);
router.get('/getCategorieById/:id', categorieController.getCategorieById);
router.get('/getAllCategories', categorieController.getAllCategories);
router.put('/updateCategorie/:id', categorieController.updateCategorie);
router.delete('/deleteCategorie/:id', categorieController.deleteCategorie);
router.get('/searchCategories/:searchTerm', categorieController.searchCategorie);




router.get('/revenue-contribution',categorieController.revenuecontribution)
router.get('/top-selling-categories', categorieController.topSellingCategories);


router.get('/total-sales-by-category', categorieController.getTotalSalesByCategory);
router.get('/average-sales-price-by-category', categorieController.getAverageSalesPriceByCategory);
router.get('/sales-distribution-by-category', categorieController.getSalesDistributionHistogram);
router.get('/top-selling-categories', categorieController.topSellingCategories);
router.get('/category-trends', categorieController.getCategoryTrends);
router.get('/number-of-products-by-category', categorieController.getNumberOfProductsByCategory);
router.get('/revenue-contribution-by-category',categorieController.getRevenueContributionByCategory);
//router.get('/stock-levels-by-category', categorieController.getStockLevelsByCategory);


module.exports = router;
