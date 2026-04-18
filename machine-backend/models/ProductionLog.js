const mongoose = require('mongoose');

const productionLogSchema = new mongoose.Schema({
  machine: { type: String, required: true }, // e.g., "Machine A"
  shift: { type: String, enum: ['Day', 'Night'], required: true },
  output: { type: Number, required: true }, // e.g., meters or items
  materialsUsed: [{
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    amount: { type: Number }
  }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProductionLog', productionLogSchema);
