import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bookings/provider').then(({ data }) => setBookings(data));
    api.get('/services/provider/mine').then(({ data }) => setServices(data));
  }, []);

  const updateStatus = async (id, status) => {
    setLoadingId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const todayCount = bookings.filter(
    (b) => new Date(b.date).toDateString() === new Date().toDateString()
  ).length;

  const revenue = bookings
    .filter((b) => b.payment?.status === 'paid')
    .reduce((sum, b) => sum + (b.serviceItem?.price || 0), 0);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <h1>Provider Dashboard</h1>
          {pendingCount > 0 && (
            <p className="subtitle" style={{ color: '#d97706', fontWeight: 500 }}>
              ⚠ {pendingCount} booking{pendingCount > 1 ? 's' : ''} waiting for your acceptance
            </p>
          )}
        </div>
        <button className="btn-outline" onClick={() => navigate('/add-service')}>
          + Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="sp-stats">
        <div className="stat-card glass">
          <p className="stat-label">Today's bookings</p>
          <p className="stat-val">{todayCount}</p>
        </div>
        <div className="stat-card glass">
          <p className="stat-label">Total bookings</p>
          <p className="stat-val">{bookings.length}</p>
        </div>
        <div className="stat-card glass">
          <p className="stat-label">Revenue earned</p>
          <p className="stat-val">₹{revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* My Services */}
      <h2 className="section-title">My Services ({services.length})</h2>
      {services.length === 0 ? (
        <p className="empty-text">No services added yet.</p>
      ) : (
        services.map((s) => (
          <div key={s._id} className="booking-item glass" style={{ marginBottom: '10px' }}>
            <div className="booking-info">
              <p className="booking-title">{s.centreName}</p>
              <p className="booking-meta">
                {s.category.replace('_', ' ')} · {s.city} · {s.services.length} service items
              </p>
            </div>
          </div>
        ))
      )}

      {/* Incoming Bookings */}
      <h2 className="section-title" style={{ marginTop: '28px' }}>
        Incoming Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="empty-text">No bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b._id} className="booking-item glass">
              <div className="booking-info">
                <p className="booking-title">
                  {b.user?.name} — {b.serviceItem?.name}
                </p>
                <p className="booking-meta">
                  {new Date(b.date).toLocaleDateString('en-IN')} at {b.timeSlot}
                  {' · '}₹{b.serviceItem?.price}
                  {' · '}{b.user?.phone || b.user?.email}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <span className={`status-pill status-${b.status}`}>{b.status}</span>

                {/* PENDING → show Accept + Reject */}
                {b.status === 'pending' && (
                  <>
                    <button
                      className="action-btn accept-btn"
                      disabled={loadingId === b._id}
                      onClick={() => updateStatus(b._id, 'confirmed')}
                    >
                      {loadingId === b._id ? '…' : '✓ Accept'}
                    </button>
                    <button
                      className="action-btn reject-btn"
                      disabled={loadingId === b._id}
                      onClick={() => updateStatus(b._id, 'cancelled')}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {/* CONFIRMED → show Mark Done + Cancel */}
                {b.status === 'confirmed' && (
                  <>
                    <button
                      className="action-btn done-btn"
                      disabled={loadingId === b._id}
                      onClick={() => updateStatus(b._id, 'completed')}
                    >
                      {loadingId === b._id ? '…' : '✓ Done'}
                    </button>
                    <button
                      className="action-btn reject-btn"
                      disabled={loadingId === b._id}
                      onClick={() => updateStatus(b._id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {/* COMPLETED or CANCELLED → no actions */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}