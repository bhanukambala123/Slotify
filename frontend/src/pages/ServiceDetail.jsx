import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORY_ICON = { salon: '✂️', car_cleaning: '🚗', repair: '🔧', other: '🏪' };

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
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="detail-header">
        <div className="detail-icon">{CATEGORY_ICON[centre.category]}</div>
        <div>
          <h1>{centre.centreName}</h1>
          <p className="subtitle">📍 {centre.address}, {centre.city}</p>
          <p className="subtitle">⭐ {centre.rating} ({centre.reviewCount} reviews)</p>
        </div>
      </div>

      <h2 className="section-title">Services & Prices</h2>
      <div className="service-list">
        {centre.services.map((item) => (
          <div key={item._id}
            className={`service-row ${selectedItem?._id === item._id ? 'selected' : ''}`}
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
        style={{ marginTop: '24px' }}
        disabled={!selectedItem}
        onClick={() => navigate(`/book/${centre._id}/${selectedItem._id}`)}>
        {selectedItem ? `Book ${selectedItem.name} →` : 'Select a service first'}
      </button>
    </div>
  );
}