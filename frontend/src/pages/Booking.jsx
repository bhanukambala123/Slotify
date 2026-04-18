import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function Booking() {
  const { serviceId, itemId } = useParams();
  const navigate              = useNavigate();

  const [centre, setCentre]           = useState(null);
  const [item, setItem]               = useState(null);
  const [selectedDate, setSelectedDate] = useState(getNext7Days()[0]);
  const [slots, setSlots]             = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    api.get(`/services/${serviceId}`).then(({ data }) => {
      setCentre(data);
      setItem(data.services.find((s) => s._id === itemId));
    });
  }, [serviceId, itemId]);

  useEffect(() => {
    if (selectedDate) fetchSlots();
  }, [selectedDate]);

  const fetchSlots = async () => {
    const { data } = await api.get(`/services/${serviceId}/available-slots`, {
      params: { date: formatDate(selectedDate) },
    });
    setSlots(data);
    setSelectedSlot(null);
  };

  const handleBookAndPay = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');
    try {
      // 1. Create booking
      const { data: booking } = await api.post('/bookings', {
        serviceId,
        serviceItemId: itemId,
        date: formatDate(selectedDate),
        timeSlot: selectedSlot,
      });

      // 2. Create Razorpay order
      const { data: order } = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      // 3. Open Razorpay checkout (Razorpay script must be loaded)
      const options = {
        key:      order.keyId,
        amount:   order.amount,
        currency: order.currency,
        name:     centre.centreName,
        description: item.name,
        order_id: order.orderId,
        handler: async (response) => {
          // 4. Verify payment on backend
          await api.post('/payments/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            bookingId:           booking._id,
          });
          navigate('/my-bookings', { state: { success: true } });
        },
        prefill: { name: '', email: '', contact: '' },
        theme:   { color: '#1D9E75' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!centre || !item) return <p className="loading-text">Loading…</p>;

  const total = item.price + 19;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/service/${serviceId}`)}>← Back</button>
      <h1>Book {item.name}</h1>
      <p className="subtitle">{centre.centreName}</p>

      <h2 className="section-title" style={{ marginTop: '24px' }}>Choose Date</h2>
      <div className="date-row">
        {getNext7Days().map((d) => (
          <div key={d.toISOString()}
            className={`date-chip ${formatDate(d) === formatDate(selectedDate) ? 'active' : ''}`}
            onClick={() => setSelectedDate(d)}>
            <div className="day">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        ))}
      </div>

      <h2 className="section-title">Available Slots</h2>
      <div className="slots-grid">
        {slots.map((s) => (
          <div key={s.time}
            className={`slot ${!s.available ? 'booked' : ''} ${selectedSlot === s.time ? 'selected' : ''}`}
            onClick={() => s.available && setSelectedSlot(s.time)}>
            {s.time}
          </div>
        ))}
      </div>

      {selectedSlot && (
        <>
          <h2 className="section-title" style={{ marginTop: '24px' }}>Summary</h2>
          <div className="booking-summary">
            <div className="summary-row"><span>Service</span><span>{item.name}</span></div>
            <div className="summary-row"><span>Date</span><span>{formatDate(selectedDate)}</span></div>
            <div className="summary-row"><span>Time</span><span>{selectedSlot}</span></div>
            <div className="summary-row"><span>Service fee</span><span>₹{item.price}</span></div>
            <div className="summary-row"><span>Convenience fee</span><span>₹19</span></div>
            <div className="summary-row summary-total"><span>Total</span><span>₹{total}</span></div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary" onClick={handleBookAndPay} disabled={loading}>
            {loading ? 'Processing…' : `Pay ₹${total} via Razorpay`}
          </button>
        </>
      )}
    </div>
  );
}