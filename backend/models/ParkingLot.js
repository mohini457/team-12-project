const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  totalSlots: {
    type: Number,
    required: true,
    min: 1
  },
  availableSlots: {
    type: Number,
    default: 0
  },
  slotTypes: {
    covered: { type: Number, default: 0 },
    openAir: { type: Number, default: 0 },
    evCharging: { type: Number, default: 0 },
    handicapAccessible: { type: Number, default: 0 }
  },
  pricing: {
    hourly: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  operatingHours: {
    open: String,
    close: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

parkingLotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);

