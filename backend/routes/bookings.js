const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ParkingLot = require('../models/ParkingLot');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = { user: req.user._id };
    
    if (req.user.role === 'manager' || req.user.role === 'admin') {
      // Managers and admins can see all bookings
      delete query.user;
      if (req.query.parkingLot) {
        query.parkingLot = req.query.parkingLot;
      }
    }

    const bookings = await Booking.find(query)
      .populate('slot', 'slotNumber type')
      .populate('parkingLot', 'name location address')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slot')
      .populate('parkingLot')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        req.user.role !== 'manager' && 
        booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', protect, [
  body('slot').notEmpty().withMessage('Slot is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('expectedEndTime').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slot: slotId, startTime, expectedEndTime, vehicleNumber, notes } = req.body;

    // Check if slot exists and is available
    const slot = await Slot.findById(slotId).populate('parkingLot');
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'Slot is not available' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      slot: slotId,
      status: { $in: ['reserved', 'active'] },
      $or: [
        { startTime: { $lte: new Date(startTime) }, endTime: { $gte: new Date(startTime) } },
        { startTime: { $lte: expectedEndTime || new Date() }, endTime: { $gte: expectedEndTime || new Date() } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Slot is already booked for this time' });
    }

    // Calculate amount (simplified - can be enhanced)
    const hours = expectedEndTime 
      ? Math.ceil((new Date(expectedEndTime) - new Date(startTime)) / (1000 * 60 * 60))
      : 1;
    const amount = hours * (slot.parkingLot.pricing.hourly || 0);

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      parkingLot: slot.parkingLot._id,
      startTime: new Date(startTime),
      expectedEndTime: expectedEndTime ? new Date(expectedEndTime) : null,
      amount,
      vehicleNumber: vehicleNumber || req.user.vehicleNumber,
      notes,
      status: 'reserved'
    });

    // Update slot status
    slot.status = 'reserved';
    slot.currentBooking = booking._id;
    await slot.save();

    // Update parking lot available slots
    const availableCount = await Slot.countDocuments({
      parkingLot: slot.parkingLot._id,
      status: 'available'
    });
    await ParkingLot.findByIdAndUpdate(slot.parkingLot._id, {
      availableSlots: availableCount
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`lot-${slot.parkingLot._id}`).emit('booking-created', booking);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('parkingLot')
      .populate('user', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/start
// @desc    Start booking (mark as active)
// @access  Private
router.put('/:id/start', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ message: 'Booking cannot be started' });
    }

    booking.status = 'active';
    booking.startTime = new Date();
    await booking.save();

    // Update slot
    const slot = await Slot.findById(booking.slot._id);
    slot.status = 'occupied';
    await slot.save();

    const io = req.app.get('io');
    io.to(`lot-${booking.parkingLot}`).emit('booking-started', booking);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Complete booking
// @access  Private
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'completed';
    booking.endTime = new Date();
    
    // Recalculate amount based on actual time
    const hours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    booking.amount = hours * (parkingLot.pricing.hourly || 0);
    
    await booking.save();

    // Update slot
    const slot = await Slot.findById(booking.slot._id);
    slot.status = 'available';
    slot.currentBooking = null;
    await slot.save();

    // Update parking lot available slots
    const availableCount = await Slot.countDocuments({
      parkingLot: booking.parkingLot,
      status: 'available'
    });
    await ParkingLot.findByIdAndUpdate(booking.parkingLot, {
      availableSlots: availableCount
    });

    const io = req.app.get('io');
    io.to(`lot-${booking.parkingLot}`).emit('booking-completed', booking);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('slot');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['reserved', 'active'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.endTime = new Date();
    await booking.save();

    // Update slot
    const slot = await Slot.findById(booking.slot._id);
    slot.status = 'available';
    slot.currentBooking = null;
    await slot.save();

    // Update parking lot available slots
    const availableCount = await Slot.countDocuments({
      parkingLot: booking.parkingLot,
      status: 'available'
    });
    await ParkingLot.findByIdAndUpdate(booking.parkingLot, {
      availableSlots: availableCount
    });

    const io = req.app.get('io');
    io.to(`lot-${booking.parkingLot}`).emit('booking-cancelled', booking);

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

