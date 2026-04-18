const ICONS = { salon: '✂️', car_cleaning: '🚗', repair: '🔧', other: '🏪' };

export default function ServiceCard({ service, onClick }) {
  return (
    <div className="service-card" onClick={onClick}>
      <div className="service-card-top">
        <div className="service-icon">{ICONS[service.category]}</div>
      </div>
      <p className="service-name">{service.centreName}</p>
      <p className="service-sub">{service.category.replace('_', ' ')} · {service.city}</p>
      <div className="service-meta">
        <span className="stars">{'★'.repeat(Math.round(service.rating))}{'☆'.repeat(5 - Math.round(service.rating))}</span>
        <span className="review-count">{service.rating} ({service.reviewCount})</span>
        {service.services[0] && (
          <span className="price-tag">from ₹{service.services[0].price}</span>
        )}
      </div>
    </div>
  );
}