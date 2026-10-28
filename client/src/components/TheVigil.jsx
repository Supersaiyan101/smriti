import { useState, useEffect, useRef } from 'react';
import CandleFlame from './CandleFlame';
import './TheVigil.css';

/**
 * TheVigil — Silent Sanctuary Mode ("Sit with Them").
 * Pure quiet presence:
 *  - Mindful Breathing Guide (4-7-8 Sacred Rhythm: Inhale 4s, Hold 7s, Release 8s)
 *  - Tap-to-Tend Ritual (gentle kindle flare & 432Hz warm harmonic chime)
 *  - Memories floating like slow embers in the night
 * 
 * @param {Object} props
 * @param {Object} props.profile - Person profile
 * @param {Array} props.memories - Preserved memory fragments
 * @param {Function} props.onClose - Callback to exit vigil
 */
export default function TheVigil({ profile, memories = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in' | 'visible' | 'fade-out'

  // Breathing Guide (4-7-8 Rhythm)
  const [breathGuideActive, setBreathGuideActive] = useState(true);
  const [breathPhase, setBreathPhase] = useState('inhale'); // 'inhale' | 'hold' | 'exhale'
  const [secondsInPhase, setSecondsInPhase] = useState(4);

  // Tap-to-Tend Ritual
  const [tendedCount, setTendedCount] = useState(0);
  const [isTendingFlare, setIsTendingFlare] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    // Listen for Escape key to exit
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Memory ember cycling (every 13s)
  useEffect(() => {
    if (!memories || memories.length === 0) return;

    const timer = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % memories.length);
        setFadeState('fade-in');
      }, 1500);
    }, 13000);

    return () => clearInterval(timer);
  }, [memories]);

  // 4-7-8 Breathing Guide Engine
  useEffect(() => {
    if (!breathGuideActive) return;

    let phase = 'inhale';
    let timeLeft = 4;
    setBreathPhase('inhale');
    setSecondsInPhase(4);

    const interval = setInterval(() => {
      timeLeft -= 1;

      if (timeLeft <= 0) {
        if (phase === 'inhale') {
          phase = 'hold';
          timeLeft = 7;
        } else if (phase === 'hold') {
          phase = 'exhale';
          timeLeft = 8;
        } else {
          phase = 'inhale';
          timeLeft = 4;
        }
        setBreathPhase(phase);
      }

      setSecondsInPhase(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [breathGuideActive]);

  // Tap-to-Tend Ritual: Warm harmonic singing bowl chime + flame flare
  const handleTendFlame = () => {
    setTendedCount((prev) => prev + 1);
    setIsTendingFlare(true);
    setRippleKey((prev) => prev + 1);

    // Play 432Hz meditative warm chime
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(216, ctx.currentTime + 2.8);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.8);
      }
    } catch {
      // Audio autoplay policy fallback
    }

    setTimeout(() => {
      setIsTendingFlare(false);
    }, 2200);
  };

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

  const getBreathLabel = () => {
    if (breathPhase === 'inhale') return `Breathe in quietly (${secondsInPhase}s)`;
    if (breathPhase === 'hold') return `Hold gently with them (${secondsInPhase}s)`;
    return `Release and exhale (${secondsInPhase}s)`;
  };

  return (
    <div className={`the-vigil-overlay fade-in vigil-phase--${breathPhase}`}>
      {/* Background Breathing Halo */}
      {breathGuideActive && (
        <div
          className={`vigil-ambient-halo vigil-ambient-halo--${breathPhase} ${isTendingFlare ? 'vigil-ambient-halo--flare' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* Top Controls */}
      <div className="vigil-top-bar">
        <button
          type="button"
          className="vigil-guide-toggle"
          onClick={() => setBreathGuideActive(!breathGuideActive)}
          title="Toggle 4-7-8 mindful breathing rhythm"
        >
          <span>{breathGuideActive ? '🌿 4-7-8 Breath Guide On' : '🌿 Breath Guide Off'}</span>
        </button>

        <button
          type="button"
          className="vigil-exit-btn"
          onClick={onClose}
          aria-label="Leave the vigil"
        >
          <span>✕</span>
          <span>Exit</span>
        </button>
      </div>

      {/* Main Vigil Hearth */}
      <div className="vigil-hearth">
        {/* Interactive Living Portrait Hearth — Tap to Tend */}
        <div
          className="vigil-portrait-container"
          onClick={handleTendFlame}
          title="Click to tend the flame"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTendFlame(); }}
        >
          <div className={`vigil-portrait ${isTendingFlare ? 'vigil-portrait--flare' : ''}`}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} />
            ) : (
              <span className="vigil-initials">{initials}</span>
            )}
            <div className="vigil-portrait-glass" aria-hidden="true" />
          </div>

          <div className="vigil-flame">
            <CandleFlame size="lg" />
          </div>

          {/* Tending Ripple Wave */}
          {isTendingFlare && (
            <div key={rippleKey} className="vigil-tend-ripple" aria-hidden="true" />
          )}
        </div>

        {/* Tap to Tend Prompt */}
        <p className="vigil-tend-prompt">
          {tendedCount === 0 ? '✦ Tap hearth to tend their flame' : `✦ Flame tended with love (${tendedCount})`}
        </p>

        {/* Name & Relationship */}
        <h2 className="vigil-name">{profile.name}</h2>
        <p className="vigil-rel">{profile.relationship}</p>

        {/* 4-7-8 Mindful Breath Guide Instruction */}
        {breathGuideActive && (
          <div className="vigil-breath-indicator fade-in">
            <div className={`vigil-breath-puck vigil-breath-puck--${breathPhase}`} />
            <span className="vigil-breath-text">{getBreathLabel()}</span>
          </div>
        )}

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

      {/* Footer Hint */}
      <footer className="vigil-footer">
        <p className="vigil-hint">
          Sit quietly for as long as you need. There is nowhere else you need to be.
        </p>
      </footer>
    </div>
  );
}
