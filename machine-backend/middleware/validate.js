// middleware/validate.js
// Request validation helpers

const { body, param, validationResult } = require('express-validator');

// ─── Handle validation errors ─────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── Validate machine ID param (must be A-E) ─────────────────────────────────
const validateMachineId = [
  param('id')
    .toUpperCase()
    .isIn(['A', 'B', 'C', 'D', 'E'])
    .withMessage('Machine ID must be one of: A, B, C, D, E'),
  handleValidationErrors,
];

// ─── Validate layer param ─────────────────────────────────────────────────────
const validateLayerParam = [
  param('layer')
    .toLowerCase()
    .isIn(['inner', 'middle', 'outer'])
    .withMessage('Layer must be one of: inner, middle, outer'),
  handleValidationErrors,
];

// ─── Validate material entry body ─────────────────────────────────────────────
const validateMaterialEntry = [
  body('shift_time')
    .notEmpty()
    .withMessage('shift_time is required')
    .isIn(['Day', 'Night'])
    .withMessage('shift_time must be Day or Night'),
  body([
    'INNFO_RMFO', 'Mic_VC', 'HEAVY_TANK', 'HEAVY_LO', 'T_MY_HD', 'T_MY_WT',
    'Hoven_Threme', 'B_RU_MAX', 'IJ_RU_BK', 'FOAL_BK', 'Mud_BK', 'FIP_BULL_BK',
    'BULL_BK', 'BK_200', 'KOR_BK', 'BLACK', 'M_BLU_V', 'BK_DARD', 'BUL_V',
    'Mod_BK', 'BK_VALUE', 'LD_BK', 'Wt_plus', 'FOAF_VH', 'Fibad',
    'Mes_LD_HD', 'LD_HD_200', 'BKod_BK', 'DDD_MIN', 'POLY',
  ])
    .optional()
    .isNumeric()
    .withMessage('Material fields must be numeric values'),
  handleValidationErrors,
];

module.exports = { validateMachineId, validateLayerParam, validateMaterialEntry };
