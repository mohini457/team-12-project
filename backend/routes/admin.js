const express = require('express');
const User = require('../models/User');
const ParkingLot = require('../models/ParkingLot');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // User statistics
    const totalUsers = await User.countDocuments();
    const drivers = await User.countDocuments({ role: 'driver' });
    const managers = await User.countDocuments({ role: 'manager' });

    // Parking lot statistics
    const totalLots = await ParkingLot.countDocuments();
    const activeLots = await ParkingLot.countDocuments({ isActive: true });

    // Slot statistics
    const totalSlots = await Slot.countDocuments();
    const availableSlots = await Slot.countDocuments({ status: 'available' });
    const occupiedSlots = await Slot.countDocuments({ status: 'occupied' });

    // Booking statistics
    let bookingQuery = {};
    if (startDate && endDate) {
      bookingQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalBookings = await Booking.countDocuments(bookingQuery);
    const activeBookings = await Booking.countDocuments({ 
      ...bookingQuery,
      status: { $in: ['reserved', 'active'] }
    });
    const completedBookings = await Booking.countDocuments({ 
      ...bookingQuery,
      status: 'completed'
    });

    // Revenue (sum of completed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { ...bookingQuery, status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Peak hours analysis
    const peakHours = await Booking.aggregate([
      { $match: bookingQuery },
      { $group: {
        _id: { $hour: '$startTime' },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      users: {
        total: totalUsers,
        drivers,
        managers
      },
      parkingLots: {
        total: totalLots,
        active: activeLots
      },
      slots: {
        total: totalSlots,
        available: availableSlots,
        occupied: occupiedSlots,
        utilizationRate: totalSlots > 0 
          ? ((occupiedSlots / totalSlots) * 100).toFixed(2) 
          : 0
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings
      },
      revenue,
      peakHours
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/parking-lots
// @desc    Get all parking lots (admin view)
// @access  Private (Admin)
router.get('/parking-lots', async (req, res) => {
  try {
    const lots = await ParkingLot.find()
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    const lotsWithStats = await Promise.all(
      lots.map(async (lot) => {
        const totalSlots = await Slot.countDocuments({ parkingLot: lot._id });
        const availableSlots = await Slot.countDocuments({ 
          parkingLot: lot._id, 
          status: 'available' 
        });
        const bookings = await Booking.countDocuments({ parkingLot: lot._id });

        return {
          ...lot.toObject(),
          totalSlots,
          availableSlots,
          bookings
        };
      })
    );

    res.json(lotsWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

