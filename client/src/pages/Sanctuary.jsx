import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortraitCard from '../components/PortraitCard';
import CandleFlame from '../components/CandleFlame';
import './Sanctuary.css';

/**
 * Sanctuary — The home screen.
 * A quiet shelf at dusk, where each remembered person rests
 * beside a living flame.
 */
export default function Sanctuary() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles || []);
      }
    } catch (err) {
      console.warn('Could not fetch profiles:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page sanctuary">
      {/* Header */}
      <header className="page-header fade-in">
        <div className="sanctuary__emblem">
          <CandleFlame size="lg" />
        </div>
        <h1>Smriti</h1>
        <p className="subtitle">A place for those who live on in you.</p>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className="sanctuary__loading fade-in">
          <CandleFlame size="md" />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Gathering the sanctuary...
          </p>
        </div>
      )}

      {/* Portrait Grid */}
      {!isLoading && profiles.length > 0 && (
        <div className="sanctuary__grid stagger">
          {profiles.map((profile) => (
            <PortraitCard
              key={profile._id}
              id={profile._id}
              name={profile.name}
              relationship={profile.relationship}
              photoUrl={profile.photoUrl}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && profiles.length === 0 && (
        <div className="sanctuary__empty fade-in-up">
          <p>The sanctuary is quiet.</p>
          <p className="sanctuary__empty-whisper">
            When you're ready, light a flame for someone you carry with you.
          </p>
          <Link
            to="/offer"
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', display: 'inline-flex' }}
          >
            <CandleFlame size="sm" />
            <span>Light the first flame</span>
          </Link>
        </div>
      )}

      {/* Floating "+" button to add someone */}
      <Link to="/offer" className="sanctuary__add-btn" aria-label="Remember someone new">
        <span className="sanctuary__add-icon">+</span>
      </Link>

      {/* Quiet Sanctuary Footer */}
      <footer className="sanctuary__footer fade-in">
        <p className="sanctuary__footer-note">
          Smriti (स्मृति) • An open-source, universal sanctuary of remembrance • MIT License
        </p>
      </footer>
    </div>
  );
}
