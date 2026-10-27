import { useState, useRef, useEffect } from 'react';
import CandleFlame from './CandleFlame';
import './HoldToLightFlame.css';

/**
 * HoldToLightFlame — The sacred lighting ceremony.
 * User presses and holds for 1.8 seconds to strike the match and light the flame.
 * 
 * @param {Object} props
 * @param {Function} props.onIgnited - Callback when flame is successfully lit
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.label="Hold to light their flame"] - Custom button label
 */
export default function HoldToLightFlame({
  onIgnited,
  disabled = false,
  label = 'Hold to light their flame',
}) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isHolding, setIsHolding] = useState(false);
  const [isLit, setIsLit] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const HOLD_DURATION = 1800; // 1.8 seconds

  const startHold = (e) => {
    if (disabled || isLit) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timerRef.current);
        setIsLit(true);
        setIsHolding(false);
        if (onIgnited) onIgnited();
      }
    }, 25);
  };

  const cancelHold = () => {
    if (isLit) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className={`hold-flame-wrapper ${isHolding ? 'is-holding' : ''} ${isLit ? 'is-lit' : ''}`}>
      <button
        type="button"
        className="hold-flame-btn"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        disabled={disabled || isLit}
        aria-label={label}
      >
        {/* Radial Progress Ring */}
        <svg className="hold-flame-ring" viewBox="0 0 100 100">
          <circle
            className="ring-bg"
            cx="50"
            cy="50"
            r="44"
          />
          <circle
            className="ring-fill"
            cx="50"
            cy="50"
            r="44"
            style={{
              strokeDashoffset: 276.46 - (276.46 * progress) / 100,
            }}
          />
        </svg>

        {/* Center Flame Icon */}
        <div className="hold-flame-center">
          <CandleFlame size={isLit ? 'md' : 'sm'} />
        </div>

        {/* Label & Instructions */}
        <div className="hold-flame-texts">
          <span className="hold-flame-title">
            {isLit ? 'Flame has been lit...' : isHolding ? 'Striking the match...' : label}
          </span>
          <span className="hold-flame-hint">
            {isLit ? 'Entering the sanctuary' : isHolding ? `${progress}%` : 'Press & hold to kindle'}
          </span>
        </div>
      </button>

      {/* Gentle flare bloom on ignition */}
      {isLit && <div className="ignition-flare" />}
    </div>
  );
}
