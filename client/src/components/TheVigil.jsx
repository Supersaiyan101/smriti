import { useState, useEffect } from 'react';
import CandleFlame from './CandleFlame';
import './TheVigil.css';

/**
 * TheVigil — Silent Sanctuary Mode ("Sit with Them").
 * No Q&A. No typing. No buttons.
 * Pure quiet presence: glowing portrait, living flame, and memories
 * fading in and out like slow embers in the night.
 * 
 * @param {Object} props
 * @param {Object} props.profile - Person profile
 * @param {Array} props.memories - Preserved memory fragments
 * @param {Function} props.onClose - Callback to exit vigil
 */
export default function TheVigil({ profile, memories = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in' | 'visible' | 'fade-out'

  useEffect(() => {
    // Listen for Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!memories || memories.length === 0) return;

    // Cycle memories every 12 seconds: 1s fade-in -> 9s visible -> 2s fade-out
    const timer = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % memories.length);
        setFadeState('fade-in');
      }, 1500);
    }, 11000);

    return () => clearInterval(timer);
  }, [memories]);

  const currentMemory = memories[currentIndex] || {
    content: 'Carried forever in the warmth of our living thoughts.',
    sourceLabel: 'Silent remembrance',
  };

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="the-vigil-overlay fade-in">
      {/* Quiet Exit Control */}
      <button
        type="button"
        className="vigil-exit-btn"
        onClick={onClose}
        aria-label="Leave the vigil"
      >
        <span>✕</span>
        <span>Exit Vigil</span>
      </button>

      {/* Main Vigil Hearth */}
      <div className="vigil-hearth">
        {/* Living Portrait Frame */}
        <div className="vigil-portrait-container">
          <div className="vigil-portrait">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} />
            ) : (
              <span className="vigil-initials">{initials}</span>
            )}
          </div>
          <div className="vigil-flame">
            <CandleFlame size="lg" />
          </div>
        </div>

        {/* Name */}
        <h2 className="vigil-name">{profile.name}</h2>
        <p className="vigil-rel">{profile.relationship}</p>

        {/* Floating Memory Ember */}
        <div className={`vigil-ember-box vigil-ember--${fadeState}`}>
          <p className="vigil-ember-text">"{currentMemory.content}"</p>
          <span className="vigil-ember-source">
            ⚓ {currentMemory.sourceLabel || 'Preserved memory'}
            {currentMemory.sensory?.weather && ` • 🌧️ ${currentMemory.sensory.weather}`}
            {currentMemory.sensory?.scent && ` • ☕ ${currentMemory.sensory.scent}`}
          </span>
        </div>
      </div>

      {/* Ambient Breathing Reminder */}
      <footer className="vigil-footer">
        <p className="vigil-hint">Sit quietly for as long as you need. There is nowhere else to be.</p>
      </footer>
    </div>
  );
}
