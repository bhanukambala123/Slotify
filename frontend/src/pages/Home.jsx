import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { label: 'All',          value: '' },
  { label: 'Salon',        value: 'salon' },
  { label: 'Car Cleaning', value: 'car_cleaning' },
  { label: 'Repair',       value: 'repair' },
];

export default function Home() {
  const [services, setServices]   = useState([]);
  const [category, setCategory]   = useState('');
  const [loading, setLoading]     = useState(true);
  const { user }                  = useAuth();
  const navigate                  = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = category ? { category } : {};
      const { data } = await api.get('/services', { params });
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <h1>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtitle">Find and book services near you</p>
        </div>
      </div>

      <div className="filter-chips">
        {CATEGORIES.map((c) => (
          <button key={c.value}
            className={`chip ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      <h2 className="section-title">Nearby Centres</h2>

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : services.length === 0 ? (
        <p className="empty-text">No service centres found nearby.</p>
      ) : (
        <div className="service-grid">
          {services.map((s) => (
            <ServiceCard key={s._id} service={s}
              onClick={() => navigate(`/service/${s._id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}