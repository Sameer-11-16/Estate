import { Link } from 'react-router-dom';
import { FiMapPin, FiSquare, FiTag, FiEye, FiStar } from 'react-icons/fi';
import { formatPrice, formatArea, getImageUrl, getLandTypeColor } from '../utils/helpers';
import './LandCard.css';

export default function LandCard({ listing }) {
  const { _id, title, location, district, area, areaUnit, price, landType, roadFacing, images, isFeatured, status, views } = listing;

  return (
    <Link to={`/listings/${_id}`} className="land-card">
      {/* Image */}
      <div className="land-card__img-wrap">
        <img
          src={getImageUrl(images?.[0])}
          alt={title}
          className="land-card__img"
          loading="lazy"
        />
        <div className="land-card__overlay" />
        {isFeatured && (
          <span className="land-card__featured"><FiStar /> Featured</span>
        )}
        <span className={`land-card__type badge badge-${getLandTypeColor(landType)}`}>{landType}</span>
        {roadFacing && <span className="land-card__road">Road Facing</span>}
      </div>

      {/* Content */}
      <div className="land-card__body">
        <h3 className="land-card__title">{title}</h3>
        <p className="land-card__location">
          <FiMapPin /> {location}, {district}
        </p>

        <div className="land-card__stats">
          <div className="stat">
            <FiSquare />
            <span>{formatArea(area, areaUnit)}</span>
          </div>
          <div className="stat">
            <FiTag />
            <span>{formatPrice(price / area)}/{areaUnit}</span>
          </div>
          <div className="stat">
            <FiEye />
            <span>{views || 0} views</span>
          </div>
        </div>

        <div className="land-card__footer">
          <span className="land-card__price">{formatPrice(price)}</span>
          <span className={`badge badge-${status === 'Available' ? 'success' : status === 'Sold' ? 'error' : 'warning'}`}>
            {status}
          </span>
        </div>
      </div>
    </Link>
  );
}
