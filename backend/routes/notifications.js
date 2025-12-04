const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Get upcoming bookings that need reminders
    const upcomingBookings = await Booking.find({
      user: req.user._id,
      status: { $in: ['reserved', 'active'] },
      expectedEndTime: { $gte: new Date() }
    })
      .populate('slot', 'slotNumber')
      .populate('parkingLot', 'name')
      .sort({ expectedEndTime: 1 });

    // Get bookings expiring soon (within 30 minutes)
    const expiringSoon = upcomingBookings.filter(booking => {
      if (!booking.expectedEndTime) return false;
      const timeUntilExpiry = booking.expectedEndTime - new Date();
      return timeUntilExpiry > 0 && timeUntilExpiry <= 30 * 60 * 1000; // 30 minutes
    });

    // Get active bookings that are about to expire
    const activeBookings = await Booking.find({
      user: req.user._id,
      status: 'active',
      startTime: { $exists: true }
    })
      .populate('slot', 'slotNumber')
      .populate('parkingLot', 'name');

    const notifications = [
      ...expiringSoon.map(booking => ({
        type: 'expiry_warning',
        message: `Your booking at ${booking.parkingLot.name} (Slot ${booking.slot.slotNumber}) is expiring soon`,
        bookingId: booking._id,
        timestamp: new Date()
      })),
      ...activeBookings.map(booking => ({
        type: 'active_booking',
        message: `You have an active booking at ${booking.parkingLot.name}`,
        bookingId: booking._id,
        timestamp: booking.startTime
      }))
    ];

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

