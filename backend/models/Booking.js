const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceItem: {
      name:     String,
      duration: Number,
      price:    Number,
    },
    date:     { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "15:00"
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: {
      method:            { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'] },
      status:            { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
      razorpayOrderId:   String,
      razorpayPaymentId: String,
      amount:            Number, // in paise (₹1 = 100 paise)
      paidAt:            Date,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);