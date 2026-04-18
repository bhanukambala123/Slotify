const mongoose = require('mongoose');

const serviceItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  duration:    { type: Number, required: true }, // minutes
  price:       { type: Number, required: true },
});

const serviceSchema = new mongoose.Schema(
  {
    provider:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    centreName: { type: String, required: true },
    category:   { type: String, enum: ['salon', 'car_cleaning', 'repair', 'other'], required: true },
    description: String,
    address:    { type: String, required: true },
    city:       { type: String, required: true },
    phone:      String,
    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    services:       [serviceItemSchema],
    availableSlots: [{ type: String }], // e.g. ["09:00", "10:00", "14:30"]
    workingDays:    { type: [Number], default: [1, 2, 3, 4, 5, 6] }, // 0=Sun
    workingHours: {
      open:  { type: String, default: '09:00' },
      close: { type: String, default: '21:00' },
    },
    rating:      { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    images:      [String],
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);