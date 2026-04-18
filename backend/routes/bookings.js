const express = require('express');
const router  = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { protect, providerOnly } = require('../middleware/auth');

// POST /api/bookings — user books a slot
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, serviceItemId, date, timeSlot } = req.body;

    const centre = await Service.findById(serviceId);
    if (!centre) return res.status(404).json({ message: 'Centre not found' });

    const item = centre.services.id(serviceItemId);
    if (!item) return res.status(404).json({ message: 'Service item not found' });

    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    const conflict = await Booking.findOne({
      service: serviceId,
      date: { $gte: start, $lte: end },
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(409).json({ message: 'Slot already booked' });

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: centre.provider,
      serviceItem: { name: item.name, duration: item.duration, price: item.price },
      date,
      timeSlot,
      payment: { amount: (item.price + 19) * 100 }, // + ₹19 convenience fee, converted to paise
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my — user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service', 'centreName address category')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/provider — provider's incoming bookings
router.get('/provider', protect, providerOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('user', 'name email phone')
      .populate('service', 'centreName')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'centreName address phone')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner    = booking.user._id.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    if (!isOwner && !isProvider)
      return res.status(403).json({ message: 'Not authorized' });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner    = booking.user.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    if (!isOwner && !isProvider)
      return res.status(403).json({ message: 'Not authorized' });

    booking.status = req.body.status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;