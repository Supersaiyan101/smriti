import './CandleFlame.css';

/**
 * CandleFlame — A gentle, living SVG candle flame.
 * The soul of Smriti's visual identity.
 * 
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} props.size - Flame size variant
 */
export default function CandleFlame({ size = 'md' }) {
  const sizes = {
    sm: { width: 16, height: 24 },
    md: { width: 24, height: 36 },
    lg: { width: 36, height: 54 },
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <div className={`candle-flame candle-flame--${size}`}>
      {/* Ambient glow behind the flame */}
      <div className="candle-flame__glow" />

      <svg
        className="candle-flame__svg"
        width={width}
        height={height}
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer flame — warm amber */}
        <path
          d="M12 2C12 2 4 14 4 22C4 28 7.6 32 12 32C16.4 32 20 28 20 22C20 14 12 2 12 2Z"
          fill="url(#flameGradientOuter)"
          className="candle-flame__outer"
        />
        {/* Inner flame — bright core */}
        <path
          d="M12 10C12 10 8 18 8 23C8 26.5 9.8 28.5 12 28.5C14.2 28.5 16 26.5 16 23C16 18 12 10 12 10Z"
          fill="url(#flameGradientInner)"
          className="candle-flame__inner"
        />

        <defs>
          <linearGradient id="flameGradientOuter" x1="12" y1="2" x2="12" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5C563" />
            <stop offset="40%" stopColor="#E8A847" />
            <stop offset="100%" stopColor="#C46D20" />
          </linearGradient>
          <linearGradient id="flameGradientInner" x1="12" y1="10" x2="12" y2="28.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF8E7" />
            <stop offset="50%" stopColor="#F5D98A" />
            <stop offset="100%" stopColor="#E8A847" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wick — small dark line at the base */}
      <div className="candle-flame__wick" />
    </div>
  );
}
