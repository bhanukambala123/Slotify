import { Scissors, CarFront, Wrench, Store, Star } from 'lucide-react';

const ICONS = { 
  salon: <Scissors size={24} />, 
  car_cleaning: <CarFront size={24} />, 
  repair: <Wrench size={24} />, 
  other: <Store size={24} /> 
};

export default function ServiceCard({ service, onClick }) {
  return (
    <div className="service-card glass" onClick={onClick}>
      <div className="service-card-top">
        <div className="service-icon-wrapper">
          {ICONS[service.category] || ICONS.other}
        </div>
      </div>
      <p className="service-name">{service.centreName}</p>
      <p className="service-sub">{service.category.replace('_', ' ')} · {service.city}</p>
      <div className="service-meta">
        <div className="stars-wrapper">
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>{service.rating}</span>
        </div>
        <span className="review-count">({service.reviewCount} reviews)</span>
        {service.services && service.services[0] && (
          <span className="price-tag">from ₹{service.services[0].price}</span>
        )}
      </div>
    </div>
  );
}