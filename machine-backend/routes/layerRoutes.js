const express = require('express');
const router = express.Router({ mergeParams: true }); // inherits :id from parent
const {
  getLayer,
  addMaterialEntry,
  updateMaterialEntry,
  deleteMaterialEntry,
  getMaterialEntry,
} = require('../controllers/layerController');

// GET    /api/machines/:id/layers/:layer             → Get all entries in a layer
router.get('/:layer', getLayer);

// POST   /api/machines/:id/layers/:layer             → Add material entry
router.post('/:layer', addMaterialEntry);

// GET    /api/machines/:id/layers/:layer/:entryId    → Get single entry
router.get('/:layer/:entryId', getMaterialEntry);

// PUT    /api/machines/:id/layers/:layer/:entryId    → Update a material entry
router.put('/:layer/:entryId', updateMaterialEntry);

// DELETE /api/machines/:id/layers/:layer/:entryId    → Delete a material entry
router.delete('/:layer/:entryId', deleteMaterialEntry);

module.exports = router;
