const Machine = require('../models/Machine');

// ─── GET all machines ────────────────────────────────────────────────────────
const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find({}, 'machine_id consentData createdAt updatedAt');
    res.status(200).json({ success: true, count: machines.length, data: machines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET single machine by ID ────────────────────────────────────────────────
const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findOne({ machine_id: req.params.id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${req.params.id} not found` });
    }

    // Auto-fix: persist any dynamically generated Mongoose _ids for legacy array elements
    machine.markModified('consentData');
    await machine.save();

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET consent data only ───────────────────────────────────────────────────
const getConsent = async (req, res) => {
  try {
    const machine = await Machine.findOne(
      { machine_id: req.params.id.toUpperCase() },
      'machine_id consentData'
    );
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${req.params.id} not found` });
    }
    res.status(200).json({ success: true, data: { machine_id: machine.machine_id, consentData: machine.consentData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADD a new consent row ───────────────────────────────────────────────────
const addConsentRow = async (req, res) => {
  try {
    const { LTR = '', MODEL = '', COLOUR = '', WEIGHT = 0, PRODUCTION = 0, shift_time = 'Day' } = req.body;
    const newRow = { LTR, MODEL, COLOUR, WEIGHT: Number(WEIGHT), PRODUCTION: Number(PRODUCTION), shift_time };

    const machine = await Machine.findOne({ machine_id: req.params.id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${req.params.id} not found` });
    }

    if (!Array.isArray(machine.consentData)) {
      machine.consentData = machine.consentData && machine.consentData.LTR ? [machine.consentData] : [];
    }

    machine.consentData.push(newRow);
    await machine.save();

    res.status(201).json({ success: true, message: 'Consent row added', data: machine.consentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE an existing consent row by _id ────────────────────────────────────
const updateConsentRow = async (req, res) => {
  try {
    const machine = await Machine.findOne({ machine_id: req.params.id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    if (!Array.isArray(machine.consentData)) {
      machine.consentData = machine.consentData && machine.consentData.LTR ? [machine.consentData] : [];
    }

    // Try finding by explicit _id, or if 'undefined'/'legacy' passed, just edit the first item
    let rowIndex = machine.consentData.findIndex(row => row._id && row._id.toString() === req.params.rowId);
    if (rowIndex === -1) {
      if (req.params.rowId === 'undefined' || req.params.rowId === 'legacy') {
        if (machine.consentData.length > 0) rowIndex = 0; // fallback to the first element if ID doesn't exist
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ success: false, message: 'Consent row not found' });
    }

    const allowedFields = ['LTR', 'MODEL', 'COLOUR', 'WEIGHT', 'PRODUCTION', 'shift_time'];
    const currentRow = machine.consentData[rowIndex];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        currentRow[field] = req.body[field];
      }
    }

    machine.markModified('consentData');
    await machine.save();
    res.status(200).json({ success: true, message: 'Consent row updated', data: machine.consentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE a consent row by _id ─────────────────────────────────────────────
const deleteConsentRow = async (req, res) => {
  try {
    const machine = await Machine.findOne({ machine_id: req.params.id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${req.params.id} not found` });
    }

    if (!Array.isArray(machine.consentData)) {
      machine.consentData = machine.consentData && machine.consentData.LTR ? [machine.consentData] : [];
    }

    if (req.params.rowId === 'undefined' || req.params.rowId === 'legacy') {
      machine.consentData = [];
    } else {
      machine.consentData = machine.consentData.filter(row => row._id && row._id.toString() !== req.params.rowId);
    }
    
    await machine.save();

    res.status(200).json({ success: true, message: 'Consent row deleted', data: machine.consentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SEED 5 machines (A-E) ───────────────────────────────────────────────────
const seedMachines = async (req, res) => {
  try {
    const machineIds = ['A', 'B', 'C', 'D', 'E'];
    const results = [];

    for (const id of machineIds) {
      const exists = await Machine.findOne({ machine_id: id });
      if (!exists) {
        await Machine.create({
          machine_id: id,
          consentData: [{ LTR: '', MODEL: '', COLOUR: '', WEIGHT: 0, PRODUCTION: 0 }],
          inner: [],
          middle: [],
          outer: [],
        });
        results.push({ machine_id: id, status: 'created' });
      } else {
        results.push({ machine_id: id, status: 'already exists' });
      }
    }

    res.status(201).json({ success: true, message: 'Seeding complete', data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Legacy alias — kept for compatibility (maps to addConsentRow)
const updateConsent = addConsentRow;

module.exports = {
  getAllMachines, getMachineById, getConsent,
  updateConsent, addConsentRow, updateConsentRow, deleteConsentRow,
  seedMachines,
};
