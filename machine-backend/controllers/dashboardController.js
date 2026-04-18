const Material = require('../models/Material');
const Transaction = require('../models/Transaction');
const ProductionLog = require('../models/ProductionLog');
const Machine = require('../models/Machine');

// ─── Stock Controllers ────────────────────────────────────────────────────────
exports.getStocks = async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Transaction Controllers ──────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('material')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { material: materialId, type, amount, reference, notes, inventoryType } = req.body;
    
    // Update stock quantity
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    
    if (type === 'IN') material.stock += Number(amount);
    else if (type === 'OUT') material.stock -= Number(amount);
    else if (type === 'ADJUST') material.stock = Number(amount);
    
    await material.save();
    
    const transaction = await Transaction.create({
      material: materialId,
      type,
      amount: Number(amount),
      reference,
      notes,
      inventoryType: inventoryType || 'CPI Inventory'
    });
    
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Production Controllers ───────────────────────────────────────────────────
exports.getProductionLogs = async (req, res) => {
  try {
    const logs = await ProductionLog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProductionLog = async (req, res) => {
  try {
    const log = await ProductionLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getProductionStats = async (req, res) => {
  try {
    const machines = await Machine.find();
    let globalTotalMaterial = 0;

    machines.forEach(m => {
      const layers = [...(m.inner || []), ...(m.middle || []), ...(m.outer || [])];
      layers.forEach(item => {
        // Correctly access numeric properties from Mongoose document
        const itemObj = item.toObject ? item.toObject() : item;
        Object.keys(itemObj).forEach(key => {
          if (!['_id', 'shift_time', 'createdAt', 'updatedAt', '__v', 'material_name'].includes(key)) {
            const val = parseFloat(itemObj[key]);
            if (!isNaN(val)) globalTotalMaterial += val;
          }
        });
      });
    });
    
    const materialCount = await Material.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalProduction: globalTotalMaterial, // Sum of all machine material
        totalDespatch: 50, // Static placeholder as per image
        materials: materialCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.seedDashboard = async (req, res) => {
    try {
        await Material.deleteMany({});
        await Transaction.deleteMany({});
        await ProductionLog.deleteMany({});

        const m1 = await Material.create({ name: 'Y', stock: 400.0, unit: 'kg', minStock: 100 });
        const m2 = await Material.create({ name: 'White LD Agloo', stock: 400.0, unit: 'kg', minStock: 200 });
        const m3 = await Material.create({ name: 'Blue LD', stock: 550.0, unit: 'kg', minStock: 150 });

        await Transaction.create({ material: m1._id, type: 'IN', amount: 400, reference: 'Initial Stock' });
        await Transaction.create({ material: m2._id, type: 'IN', amount: 400, reference: 'Initial Stock' });
        await Transaction.create({ material: m3._id, type: 'IN', amount: 550, reference: 'Initial Stock' });

        await ProductionLog.create({ machine: 'Machine A', shift: 'Day', output: 350 });
        await ProductionLog.create({ machine: 'Machine B', shift: 'Night', output: 420 });

        res.json({ success: true, message: 'Dashboard seeded successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
