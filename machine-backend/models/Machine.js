const mongoose = require('mongoose');

const materialEntrySchema = new mongoose.Schema(
  {
    shift_time: { type: String, required: true, enum: ['Day', 'Night'] },
  },
  { timestamps: true, strict: false }
);

// ─── Consent Entry Sub-Schema ─────────────────────────────────────────────────
const consentEntrySchema = new mongoose.Schema(
  {
    LTR:        { type: String, default: '' },
    MODEL:      { type: String, default: '' },
    COLOUR:     { type: String, default: '' },
    WEIGHT:     { type: Number, default: 0 },
    PRODUCTION: { type: Number, default: 0 },
    shift_time: { type: String, default: 'Day', enum: ['Day', 'Night'] },
  },
  { _id: true }
);

// ─── Machine Schema ──────────────────────────────────────────────────────────
const machineSchema = new mongoose.Schema(
  {
    machine_id: {
      type: String,
      required: true,
      unique: true,
      enum: ['A', 'B', 'C', 'D', 'E'],
      uppercase: true,
    },

    // ── Consent Data — array of LTR rows ────────────────────────────────────
    consentData: { type: [consentEntrySchema], default: [] },

    // ── Editable Layers ──────────────────────────────────────────────────────
    inner:  { type: [materialEntrySchema], default: [] },
    middle: { type: [materialEntrySchema], default: [] },
    outer:  { type: [materialEntrySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);
