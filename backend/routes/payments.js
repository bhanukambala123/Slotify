const express  = require('express');
const router   = express.Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const order = await razorpay.orders.create({
      amount:   booking.payment.amount,
      currency: 'INR',
      receipt:  `rcpt_${req.body.bookingId}`,
      notes:    { bookingId: req.body.bookingId },
    });

    booking.payment.razorpayOrderId = order.id;
    await booking.save();

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency,
               keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    const booking = await Booking.findById(bookingId);
    booking.payment.razorpayPaymentId = razorpay_payment_id;
    booking.payment.status = 'paid';
    booking.payment.paidAt = new Date();
    booking.status         = 'confirmed';
    await booking.save();

    res.json({ message: 'Payment verified and booking confirmed', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;