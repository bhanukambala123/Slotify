import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const STATUS_CLASS = {
  confirmed: 'status-confirmed',
  pending:   'status-pending',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const location                = useLocation();

  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <h1>My Bookings</h1>

      {location.state?.success && (
        <div className="success-banner">
          ✓ Booking confirmed and payment received!
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="empty-text">No bookings yet. Go book a service!</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="booking-item glass">
              <div className="booking-info">
                <p className="booking-title">
                  {b.service?.centreName} — {b.serviceItem?.name}
                </p>
                <p className="booking-meta">
                  {new Date(b.date).toLocaleDateString('en-IN')} at {b.timeSlot}
                  {' · '}₹{b.serviceItem?.price}
                </p>
              </div>
              <span className={`status-pill ${STATUS_CLASS[b.status]}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}