import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { label: 'All',          value: '' },
  { label: 'Salon',        value: 'salon' },
  { label: 'Car Washing', value: 'car_cleaning' },
  { label: 'Repair',       value: 'repair' },
];

// Returns greeting based on actual current time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]   = useState(true);
  const [greeting, setGreeting] = useState(getGreeting());
  const { user }                = useAuth();
  const navigate                = useNavigate();

  // Update greeting every minute in case user stays on page across time boundary
  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.centreName?.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q)
    );
  });

  const groupedServices = filteredServices.reduce((acc, s) => {
    const city = s.city || 'Other';
    if (!acc[city]) acc[city] = [];
    acc[city].push(s);
    return acc;
  }, {});

  const sortedCities = Object.keys(groupedServices).sort();

  return (
    <div className="page">
      <div className="home-header">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtitle">Find and book services near you</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
        <input 
          type="text" 
          className="search-input"
          placeholder="Search for centres or cities..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none', fontSize: '15px', transition: 'var(--transition)' }}
        />
      </div>

      <div className="filter-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`chip ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading…</p>
      ) : sortedCities.length === 0 ? (
        <p className="empty-text">No service centres found.</p>
      ) : (
        sortedCities.map((city) => (
          <div key={city} style={{ marginBottom: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: '16px' }}>{city} Centres</h2>
            <div className="service-grid">
              {groupedServices[city].map((s) => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  onClick={() => navigate(`/service/${s._id}`)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}