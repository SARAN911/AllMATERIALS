const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Stock
router.get('/stock', dashboardController.getStocks);
router.post('/stock', dashboardController.addStock);
router.put('/stock/:id', dashboardController.updateStock);

// Transactions
router.get('/transactions', dashboardController.getTransactions);
router.post('/transactions', dashboardController.addTransaction);
router.put('/transactions/:id', dashboardController.updateTransaction);

// Production
router.get('/production', dashboardController.getProductionLogs);
router.post('/production', dashboardController.addProductionLog);
router.get('/production/stats', dashboardController.getProductionStats);

// Seed
router.post('/seed', dashboardController.seedDashboard);

module.exports = router;
