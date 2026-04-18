import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

export default function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    centreName: '', category: 'salon', description: '',
    address: '', city: '', phone: '',
    availableSlots: [...DEFAULT_SLOTS],
  });
  const [services, setServices] = useState([
    { name: '', duration: 30, price: '' },
  ]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const addServiceItem = () =>
    setServices([...services, { name: '', duration: 30, price: '' }]);

  const updateItem = (i, field, val) => {
    const updated = [...services];
    updated[i][field] = val;
    setServices(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/services', { ...form, services });
      // Navigate to dashboard after creating
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Dashboard</button>
      <h1>Add Service Centre</h1>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h2 className="section-title">Centre Info</h2>
        <div className="field">
          <label>Centre name</label>
          <input value={form.centreName}
            onChange={(e) => setForm({ ...form, centreName: e.target.value })}
            placeholder="Glam Studio" required />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Category</label>
            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="salon">Salon</option>
              <option value="car_cleaning">Car Cleaning</option>
              <option value="repair">Repair</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210" />
          </div>
        </div>
        <div className="field">
          <label>Address</label>
          <input value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="12B, Banjara Hills Road" required />
        </div>
        <div className="field">
          <label>City</label>
          <input value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="Hyderabad" required />
        </div>

        <h2 className="section-title" style={{ marginTop: '24px' }}>Service Items</h2>
        {services.map((item, i) => (
          <div key={i} className="service-item-row">
            <input placeholder="Service name (e.g. Haircut)"
              value={item.name}
              onChange={(e) => updateItem(i, 'name', e.target.value)} required />
            <input type="number" placeholder="Duration (min)"
              value={item.duration}
              onChange={(e) => updateItem(i, 'duration', e.target.value)} />
            <input type="number" placeholder="Price (₹)"
              value={item.price}
              onChange={(e) => updateItem(i, 'price', e.target.value)} required />
          </div>
        ))}
        <button type="button" className="btn-outline" onClick={addServiceItem}>
          + Add another service
        </button>

        <button type="submit" className="btn-primary" disabled={loading}
          style={{ marginTop: '24px' }}>
          {loading ? 'Saving…' : 'Create Service Centre'}
        </button>
      </form>
    </div>
  );
}