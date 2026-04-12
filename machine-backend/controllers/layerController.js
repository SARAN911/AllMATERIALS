const Machine = require('../models/Machine');

const VALID_LAYERS = ['inner', 'middle', 'outer'];

// ─── Helper: validate layer ───────────────────────────────────────────────────
const validateLayer = (layer) => VALID_LAYERS.includes(layer.toLowerCase());

// ─── GET all entries in a layer ──────────────────────────────────────────────
const getLayer = async (req, res) => {
  try {
    const { id, layer } = req.params;
    if (!validateLayer(layer)) {
      return res.status(400).json({ success: false, message: `Invalid layer. Use: inner, middle, outer` });
    }

    const machine = await Machine.findOne({ machine_id: id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${id} not found` });
    }

    res.status(200).json({
      success: true,
      machine_id: machine.machine_id,
      layer: layer.toLowerCase(),
      count: machine[layer.toLowerCase()].length,
      data: machine[layer.toLowerCase()],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADD a new material entry to a layer ────────────────────────────────────
const addMaterialEntry = async (req, res) => {
  try {
    const { id, layer } = req.params;
    if (!validateLayer(layer)) {
      return res.status(400).json({ success: false, message: `Invalid layer. Use: inner, middle, outer` });
    }

    if (!req.body.shift_time) {
      return res.status(400).json({ success: false, message: 'shift_time is required' });
    }

    const machine = await Machine.findOne({ machine_id: id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${id} not found` });
    }

    const layerKey = layer.toLowerCase();
    machine[layerKey].push(req.body);
    await machine.save();

    const added = machine[layerKey][machine[layerKey].length - 1];
    res.status(201).json({
      success: true,
      message: `Material entry added to ${layerKey} layer`,
      data: added,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE a material entry in a layer ─────────────────────────────────────
const updateMaterialEntry = async (req, res) => {
  try {
    const { id, layer, entryId } = req.params;
    if (!validateLayer(layer)) {
      return res.status(400).json({ success: false, message: `Invalid layer. Use: inner, middle, outer` });
    }

    const machine = await Machine.findOne({ machine_id: id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${id} not found` });
    }

    const layerKey = layer.toLowerCase();
    const entry = machine[layerKey].id(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: `Entry ${entryId} not found in ${layerKey} layer` });
    }

    // Completely replace the old entry with the new data to allow field deletion
    const entryIndex = machine[layerKey].findIndex(e => e._id.toString() === entryId);
    if (entryIndex !== -1) {
      machine[layerKey].set(entryIndex, { _id: entryId, ...req.body });
    }
    await machine.save();

    res.status(200).json({
      success: true,
      message: `Entry updated in ${layerKey} layer`,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE a material entry from a layer ───────────────────────────────────
const deleteMaterialEntry = async (req, res) => {
  try {
    const { id, layer, entryId } = req.params;
    if (!validateLayer(layer)) {
      return res.status(400).json({ success: false, message: `Invalid layer. Use: inner, middle, outer` });
    }

    const machine = await Machine.findOne({ machine_id: id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${id} not found` });
    }

    const layerKey = layer.toLowerCase();
    const entry = machine[layerKey].id(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: `Entry ${entryId} not found in ${layerKey} layer` });
    }

    const shiftTime = entry.shift_time;
    entry.deleteOne();
    await machine.save();

    res.status(200).json({
      success: true,
      message: `Shift entry "${shiftTime}" removed from ${layerKey} layer`,
      remaining_count: machine[layerKey].length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET single material entry by ID ────────────────────────────────────────
const getMaterialEntry = async (req, res) => {
  try {
    const { id, layer, entryId } = req.params;
    if (!validateLayer(layer)) {
      return res.status(400).json({ success: false, message: `Invalid layer. Use: inner, middle, outer` });
    }

    const machine = await Machine.findOne({ machine_id: id.toUpperCase() });
    if (!machine) {
      return res.status(404).json({ success: false, message: `Machine ${id} not found` });
    }

    const layerKey = layer.toLowerCase();
    const entry = machine[layerKey].id(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: `Entry ${entryId} not found in ${layerKey} layer` });
    }

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLayer, addMaterialEntry, updateMaterialEntry, deleteMaterialEntry, getMaterialEntry };
