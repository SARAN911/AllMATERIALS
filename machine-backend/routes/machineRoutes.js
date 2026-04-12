const express = require('express');
const router = express.Router();
const {
  getAllMachines,
  getMachineById,
  getConsent,
  addConsentRow,
  updateConsentRow,
  deleteConsentRow,
} = require('../controllers/machineController');

const { seedMachines } = require('../controllers/machineController');

// POST  /api/machines/seed                       → Seed 5 machines (A-E)
router.post('/seed', seedMachines);

// GET   /api/machines                            → Get all machines (summary)
router.get('/', getAllMachines);

// GET   /api/machines/:id                        → Get full machine (A-E)
router.get('/:id', getMachineById);

// GET   /api/machines/:id/consent                → Get consent data only
router.get('/:id/consent', getConsent);

// POST  /api/machines/:id/consent                → Add a new consent row
router.post('/:id/consent', addConsentRow);

// PUT   /api/machines/:id/consent/:rowId         → Update a consent row by _id
router.put('/:id/consent/:rowId', updateConsentRow);

// DELETE /api/machines/:id/consent/:rowId        → Delete a consent row by _id
router.delete('/:id/consent/:rowId', deleteConsentRow);

module.exports = router;

