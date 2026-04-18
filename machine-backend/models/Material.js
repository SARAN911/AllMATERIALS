const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, default: 'Raw Material' },
  unit: { type: String, default: 'kg' },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 100 },
  status: { type: String, enum: ['In stock', 'Low stock', 'Out of stock'], default: 'In stock' }
}, { timestamps: true });

// Auto-update status based on stock levels
materialSchema.pre('save', function(next) {
  if (this.stock <= 0) {
    this.status = 'Out of stock';
  } else if (this.stock <= this.minStock) {
    this.status = 'Low stock';
  } else {
    this.status = 'In stock';
  }
  next();
});

module.exports = mongoose.model('Material', materialSchema);
