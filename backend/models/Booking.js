const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  expectedEndTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['reserved', 'active', 'completed', 'cancelled', 'expired'],
    default: 'reserved'
  },
  amount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String
  },
  vehicleNumber: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ slot: 1, status: 1 });
bookingSchema.index({ parkingLot: 1, status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

