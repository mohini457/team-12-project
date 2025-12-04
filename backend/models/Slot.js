const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  type: {
    type: String,
    enum: ['covered', 'openAir', 'evCharging', 'handicapAccessible'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  location: {
    row: String,
    position: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
slotSchema.index({ parkingLot: 1, status: 1 });
slotSchema.index({ parkingLot: 1, type: 1, status: 1 });

module.exports = mongoose.model('Slot', slotSchema);

