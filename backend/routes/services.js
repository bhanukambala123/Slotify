const express = require('express');
const router  = express.Router();
const Service = require('../models/Service');
const { protect, providerOnly } = require('../middleware/auth');

// GET /api/services?lat=17.4&lng=78.4&category=salon
router.get('/', async (req, res) => {
  try {
    const { lat, lng, category, radius = 5000 } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;

    let services;
    if (lat && lng) {
      services = await Service.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius),
          },
        },
      }).populate('provider', 'name phone');
    } else {
      services = await Service.find(query).populate('provider', 'name phone');
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/services/provider/mine
router.get('/provider/mine', protect, providerOnly, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name phone');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/services/:id/available-slots?date=2025-04-19
router.get('/:id/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date param required' });

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const Booking = require('../models/Booking');
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    const booked = await Booking.find({
      service: service._id,
      date: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = booked.map((b) => b.timeSlot);
    const slots = service.availableSlots.map((slot) => ({
      time: slot,
      available: !bookedSlots.includes(slot),
    }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/services — provider creates a centre
router.post('/', protect, providerOnly, async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, provider: req.user._id });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/services/:id — provider updates their centre
router.put('/:id', protect, providerOnly, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, provider: req.user._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    Object.assign(service, req.body);
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/services/:id/items — add a service item (haircut, wash, etc.)
router.post('/:id/items', protect, providerOnly, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, provider: req.user._id });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    service.services.push(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;