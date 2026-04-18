import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Scissors, CarFront, Wrench, Store, MapPin, Star, ArrowLeft } from 'lucide-react';

const CATEGORY_ICON = { 
  salon: <Scissors size={32} />, 
  car_cleaning: <CarFront size={32} />, 
  repair: <Wrench size={32} />, 
  other: <Store size={32} /> 
};

export default function ServiceDetail() {
  const { id }                        = useParams();
  const navigate                      = useNavigate();
  const [centre, setCentre]           = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    api.get(`/services/${id}`).then(({ data }) => setCentre(data));
  }, [id]);

  if (!centre) return <p className="loading-text">Loading…</p>;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')}><ArrowLeft size={16} /> Back</button>

      <div className="detail-header glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <div className="detail-icon-large">{CATEGORY_ICON[centre.category] || CATEGORY_ICON.other}</div>
        <div>
          <h1>{centre.centreName}</h1>
          <p className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MapPin size={14} /> {centre.address}, {centre.city}
          </p>
          <p className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <Star size={14} fill="#F59E0B" color="#F59E0B" /> {centre.rating} ({centre.reviewCount} reviews)
          </p>
        </div>
      </div>

      <h2 className="section-title">Services & Prices</h2>
      <div className="service-list">
        {centre.services.map((item) => (
          <div key={item._id}
            className={`service-row glass ${selectedItem?._id === item._id ? 'selected' : ''}`}
            onClick={() => setSelectedItem(item)}>
            <div>
              <p className="service-row-name">{item.name}</p>
              <p className="service-row-dur">{item.duration} min</p>
            </div>
            <p className="service-row-price">₹{item.price}</p>
          </div>
        ))}
      </div>

      <button className="btn-primary"
        style={{ marginTop: '32px' }}
        disabled={!selectedItem}
        onClick={() => navigate(`/book/${centre._id}/${selectedItem._id}`)}>
        {selectedItem ? `Book ${selectedItem.name} →` : 'Select a service first'}
      </button>
    </div>
  );
}