import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const navigate                = useNavigate();

  useEffect(() => {
    api.get('/bookings/provider').then(({ data }) => setBookings(data));
    api.get('/services/provider/mine').then(({ data }) => setServices(data));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b))
    );
  };

  const todayCount = bookings.filter(
    (b) => new Date(b.date).toDateString() === new Date().toDateString()
  ).length;

  const revenue = bookings
    .filter((b) => b.payment?.status === 'paid')
    .reduce((sum, b) => sum + (b.serviceItem?.price || 0), 0);

  return (
    <div className="page">
      <div className="home-header">
        <h1>Provider Dashboard</h1>
        <button className="btn-outline" onClick={() => navigate('/add-service')}>
          + Add Service
        </button>
      </div>

      <div className="sp-stats">
        <div className="stat-card">
          <p className="stat-label">Today's bookings</p>
          <p className="stat-val">{todayCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total bookings</p>
          <p className="stat-val">{bookings.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Revenue earned</p>
          <p className="stat-val">₹{revenue.toLocaleString()}</p>
        </div>
      </div>

      <h2 className="section-title">My Services ({services.length})</h2>
      {services.map((s) => (
        <div key={s._id} className="booking-item" style={{ marginBottom: '10px' }}>
          <div className="booking-info">
            <p className="booking-title">{s.centreName}</p>
            <p className="booking-meta">{s.category} · {s.city} · {s.services.length} service items</p>
          </div>
        </div>
      ))}

      <h2 className="section-title" style={{ marginTop: '24px' }}>Incoming Bookings</h2>
      <div className="booking-list">
        {bookings.map((b) => (
          <div key={b._id} className="booking-item">
            <div className="booking-info">
              <p className="booking-title">{b.user?.name} — {b.serviceItem?.name}</p>
              <p className="booking-meta">
                {new Date(b.date).toLocaleDateString('en-IN')} at {b.timeSlot}
                {' · '}₹{b.serviceItem?.price}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className={`status-pill status-${b.status}`}>{b.status}</span>
              {b.status === 'confirmed' && (
                <button className="btn-sm" onClick={() => updateStatus(b._id, 'completed')}>
                  Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}