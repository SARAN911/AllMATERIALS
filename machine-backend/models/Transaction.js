const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  type: { type: String, enum: ['IN', 'OUT', 'ADJUST'], required: true },
  amount: { type: Number, required: true },
  inventoryType: { type: String, enum: ['CPI Inventory', 'New Inventory'], default: 'CPI Inventory' },
  reference: { type: String }, // e.g., "PO-123", "Machine A Usage"
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
