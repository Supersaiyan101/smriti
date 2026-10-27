import { Link } from 'react-router-dom';
import CandleFlame from './CandleFlame';
import './PortraitCard.css';

/**
 * PortraitCard — A single remembered person on the Sanctuary shelf.
 * Shows their photo (or initials), name, relationship, and a living flame.
 * 
 * @param {Object} props
 * @param {string} props.id - Profile ID
 * @param {string} props.name - Name of the person remembered
 * @param {string} props.relationship - How they were related ("My father", "Best friend")
 * @param {string} [props.photoUrl] - Optional photo URL
 */
export default function PortraitCard({ id, name, relationship, photoUrl }) {
  // Generate initials for the fallback avatar
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link to={`/remember/${id}`} className="portrait-card" aria-label={`Remember ${name}`}>
      <div className="portrait-card__frame">
        {/* Photo or initials fallback */}
        <div className="portrait-card__photo">
          {photoUrl ? (
            <img src={photoUrl} alt={name} loading="lazy" />
          ) : (
            <span className="portrait-card__initials">{initials}</span>
          )}
        </div>

        {/* The living flame */}
        <div className="portrait-card__flame">
          <CandleFlame size="sm" />
        </div>
      </div>

      {/* Name and relationship */}
      <div className="portrait-card__info">
        <h3 className="portrait-card__name">{name}</h3>
        <p className="portrait-card__relationship">{relationship}</p>
      </div>
    </Link>
  );
}
