import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
 
// Check if a slot time is in the past for today
function isSlotPast(slotTime, selectedDate) {
  const today = new Date();
  const isToday =
    selectedDate.getDate()     === today.getDate() &&
    selectedDate.getMonth()    === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();
 
  if (!isToday) return false;
 
  const [slotHour, slotMin] = slotTime.split(':').map(Number);
  const slotDate = new Date();
  slotDate.setHours(slotHour, slotMin, 0, 0);
 
  return slotDate <= today;
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
    try {
      const { data } = await api.get(`/services/${serviceId}/available-slots`, {
        params: { date: formatDate(selectedDate) },  // local date, no UTC shift
      });
      setSlots(data);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    }
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
        theme:   { color: '#8B5CF6' },
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
      <button className="back-btn" onClick={() => navigate(`/service/${serviceId}`)}>
        <ArrowLeft size={16} /> Back
      </button>
 
      <h1>Book {item.name}</h1>
      <p className="subtitle">{centre.centreName} · {centre.city}</p>
 
      {/* Date picker */}
      <h2 className="section-title" style={{ marginTop: '24px' }}>Choose Date</h2>
      <div className="date-row">
        {getNext7Days().map((d) => (
          <div
            key={formatDate(d)}
            className={`date-chip ${formatDate(d) === formatDate(selectedDate) ? 'active' : ''}`}
            onClick={() => setSelectedDate(d)}
          >
            <div className="day">
              {d.toLocaleDateString('en-IN', { weekday: 'short' })}
            </div>
            {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        ))}
      </div>

      <h2 className="section-title">Available Slots</h2>
      {slots.length === 0 ? (
        <p className="empty-text">No slots configured for this centre yet.</p>
      ) : (
        <>
          <div className="slots-grid">
            {slots.map((s) => {
              const past     = isSlotPast(s.time, selectedDate);
              const unavail  = !s.available || past;
              const isSelect = selectedSlot === s.time;
              return (
                <div
                  key={s.time}
                  className={`slot ${unavail ? 'booked' : ''} ${isSelect ? 'selected' : ''}`}
                  onClick={() => !unavail && setSelectedSlot(s.time)}
                  title={past ? 'This time has already passed' : !s.available ? 'Already booked' : ''}
                >
                  {s.time}
                  {past && <span style={{ fontSize: '9px', display: 'block', opacity: 0.6 }}>past</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Strikethrough = booked or past</span>
            <span style={{ color: '#1D9E75', fontWeight: 500 }}>Green = your selection</span>
          </div>
        </>
      )}

      {selectedSlot && (
        <>
          <h2 className="section-title" style={{ marginTop: '24px' }}>Booking Summary</h2>
          <div className="booking-summary">
            <div className="summary-row">
              <span>Service</span><span>{item.name}</span>
            </div>
            <div className="summary-row">
              <span>Date</span>
              <span>
                {selectedDate.toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
            <div className="summary-row">
              <span>Time</span><span>{selectedSlot}</span>
            </div>
            <div className="summary-row">
              <span>Duration</span><span>{item.duration} min</span>
            </div>
            <div className="summary-row">
              <span>Service fee</span><span>₹{item.price}</span>
            </div>
            <div className="summary-row">
              <span>Convenience fee</span><span>₹19</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
 
          {error && <div className="error-msg">{error}</div>}
 
          <button
            className="btn-primary"
            onClick={handleBookAndPay}
            disabled={loading}
          >
            {loading ? 'Processing…' : `Pay ₹${total} via Razorpay`}
          </button>
        </>
      )}
    </div>
  );
}