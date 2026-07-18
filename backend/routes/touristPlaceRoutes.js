const express = require('express');
const router = express.Router();
const {
  getTouristPlaces,
  getTouristPlaceByName,
  createTouristPlace,
  updateTouristPlace,
  deleteTouristPlace
} = require('../controllers/touristPlaceController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// Public routes
router.get('/', getTouristPlaces);
router.get('/:name', getTouristPlaceByName);

// Protected routes (Admin only)
router.post('/', adminProtect, createTouristPlace);
router.put('/:name', adminProtect, updateTouristPlace);
router.delete('/:name', adminProtect, deleteTouristPlace);

module.exports = router;
