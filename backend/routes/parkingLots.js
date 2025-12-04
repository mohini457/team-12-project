const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingLot = require('../models/ParkingLot');
const Slot = require('../models/Slot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking-lots
// @desc    Get all parking lots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, minSlots, type } = req.query;
    let query = { isActive: true };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    const lots = await ParkingLot.find(query)
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    res.json(lots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/parking-lots/:id
// @desc    Get single parking lot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id)
      .populate('manager', 'name email phone');

    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Get slot statistics
    const slotStats = await Slot.aggregate([
      { $match: { parkingLot: lot._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const typeStats = await Slot.aggregate([
      { $match: { parkingLot: lot._id } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      ...lot.toObject(),
      slotStats,
      typeStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/parking-lots
// @desc    Create parking lot
// @access  Private (Manager/Admin)
router.post('/', protect, authorize('manager', 'admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('location.latitude').isFloat().withMessage('Valid latitude is required'),
  body('location.longitude').isFloat().withMessage('Valid longitude is required'),
  body('totalSlots').isInt({ min: 1 }).withMessage('Total slots must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lotData = {
      ...req.body,
      manager: req.user.role === 'admin' ? (req.body.manager || req.user._id) : req.user._id,
      availableSlots: req.body.totalSlots || 0
    };

    const lot = await ParkingLot.create(lotData);

    // Create slots
    if (req.body.totalSlots) {
      const slots = [];
      for (let i = 1; i <= req.body.totalSlots; i++) {
        slots.push({
          slotNumber: `SL-${String(i).padStart(3, '0')}`,
          parkingLot: lot._id,
          type: 'openAir', // Default type
          status: 'available'
        });
      }
      await Slot.insertMany(slots);
    }

    const io = req.app.get('io');
    io.emit('parking-lot-created', lot);

    res.status(201).json(lot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/parking-lots/:id
// @desc    Update parking lot
// @access  Private (Manager/Admin)
router.put('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    // Check if user is the manager or admin
    if (req.user.role !== 'admin' && lot.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(lot, req.body);
    await lot.save();

    const io = req.app.get('io');
    io.emit('parking-lot-updated', lot);

    res.json(lot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/parking-lots/:id
// @desc    Delete parking lot
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    await ParkingLot.findByIdAndDelete(req.params.id);
    await Slot.deleteMany({ parkingLot: req.params.id });

    const io = req.app.get('io');
    io.emit('parking-lot-deleted', req.params.id);

    res.json({ message: 'Parking lot deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

