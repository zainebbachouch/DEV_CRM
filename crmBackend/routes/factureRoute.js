const express = require("express");
const factureController = require("../controllers/factureController");
const router = express.Router();

//getAllFactures
router.get('/getInvoiceDetailsByCommandId/:CommandId', factureController.getInvoiceDetailsByCommandId);
router.get("/getAllFactures", factureController.getAllFactures);
router.put("/createInvoice",factureController.createInvoice);
router.delete("/deleteInvoice/:idcommande", factureController.deleteInvoiceByCommandId);
router.get("/getFactureOfClientAuthorized",factureController.getFactureOfClientAuthorized);
router.get("/fetchPDFInvoice/",factureController.fetchPDFInvoice);


router.post("/createPDFInvoice", factureController.creatPDFInvoice);
router.get('/searchFactures', factureController.searchFactures);

/////////////dashobord 
router.get("/totalrevenue",factureController.getTotalRevenue);

router.get('/averageinvoicevalue', factureController.getAverageInvoiceValue);

router.get('/invoice-count', factureController.getInvoiceCount);

router.get('/distribution', factureController.getInvoiceAmountDistribution);

router.get('/invoice-frequency', factureController.getInvoiceFrequency);

router.get('/outstanding-invoices', factureController.getOutstandingInvoices);

// Route pour obtenir le délai moyen de paiement des factures
router.get('/payment-timeliness', factureController.getPaymentTimeliness);


module.exports = router;
