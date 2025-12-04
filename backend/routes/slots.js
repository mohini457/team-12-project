const express = require('express');
const Slot = require('../models/Slot');
const ParkingLot = require('../models/ParkingLot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/slots
// @desc    Get slots by parking lot
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { parkingLot, status, type } = req.query;
    let query = {};

    if (parkingLot) query.parkingLot = parkingLot;
    if (status) query.status = status;
    if (type) query.type = type;

    const slots = await Slot.find(query)
      .populate('parkingLot', 'name location')
      .populate('currentBooking')
      .sort({ slotNumber: 1 });

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/slots/:id
// @desc    Get single slot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate('parkingLot')
      .populate('currentBooking');

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/slots/:id/status
// @desc    Update slot status (Manual update by manager)
// @access  Private (Manager/Admin)
router.put('/:id/status', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const slot = await Slot.findById(req.params.id).populate('parkingLot');

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        slot.parkingLot.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate status
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: available, occupied, reserved, or maintenance' });
    }

    const oldStatus = slot.status;
    slot.status = status;
    slot.lastUpdated = new Date();
    await slot.save();

    // Update parking lot available slots count
    const availableCount = await Slot.countDocuments({
      parkingLot: slot.parkingLot._id,
      status: 'available'
    });
    
    await ParkingLot.findByIdAndUpdate(slot.parkingLot._id, {
      availableSlots: availableCount
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`lot-${slot.parkingLot._id}`).emit('slot-status-updated', {
      slotId: slot._id,
      status: slot.status,
      oldStatus
    });

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/slots/:id
// @desc    Update slot details
// @access  Private (Manager/Admin)
router.put('/:id', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id).populate('parkingLot');

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        slot.parkingLot.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(slot, req.body);
    await slot.save();

    const io = req.app.get('io');
    io.to(`lot-${slot.parkingLot._id}`).emit('slot-updated', slot);

    res.json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/slots/bulk-update
// @desc    Bulk update slots (Manual update by manager)
// @access  Private (Manager/Admin)
router.post('/bulk-update', protect, authorize('manager', 'admin'), async (req, res) => {
  try {
    const { parkingLotId, updates } = req.body; // Array of { slotId, status, type? }

    if (!parkingLotId || !updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'parkingLotId and updates array are required' });
    }

    // Verify manager owns this parking lot
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    if (req.user.role !== 'admin' && 
        parkingLot.manager.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update slots in this parking lot' });
    }

    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        if (!update.slotId || !update.status) {
          errors.push({ slotId: update.slotId, error: 'slotId and status are required' });
          continue;
        }

        if (!validStatuses.includes(update.status)) {
          errors.push({ slotId: update.slotId, error: 'Invalid status' });
          continue;
        }

        const slot = await Slot.findById(update.slotId).populate('parkingLot');
        if (!slot) {
          errors.push({ slotId: update.slotId, error: 'Slot not found' });
          continue;
        }

        // Verify slot belongs to the parking lot
        if (slot.parkingLot._id.toString() !== parkingLotId) {
          errors.push({ slotId: update.slotId, error: 'Slot does not belong to this parking lot' });
          continue;
        }

        // Update slot
        slot.status = update.status;
        if (update.type) {
          slot.type = update.type;
        }
        slot.lastUpdated = new Date();
        await slot.save();
        results.push(slot);
      } catch (error) {
        errors.push({ slotId: update.slotId, error: error.message });
      }
    }

    // Update parking lot available slots count
    const availableCount = await Slot.countDocuments({
      parkingLot: parkingLotId,
      status: 'available'
    });
    
    await ParkingLot.findByIdAndUpdate(parkingLotId, {
      availableSlots: availableCount
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`lot-${parkingLotId}`).emit('slots-bulk-updated', results);

    res.json({ 
      updated: results.length, 
      errors: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

