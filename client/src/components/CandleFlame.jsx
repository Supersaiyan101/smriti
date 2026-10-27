import { useEffect, useRef, useState } from 'react';
import './CandleFlame.css';

/**
 * CandleFlame — A gentle, living candle flame with real-time breathing physics,
 * draft responsiveness to cursor breezes, and rising golden ember particles.
 * 
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Flame size variant
 * @param {boolean} [props.showEmbers] - Whether golden embers float upward (default true for md/lg)
 * @param {boolean} [props.interactive=true] - Whether flame leans softly from cursor drafts
 * @param {string} [props.className=''] - Additional classes
 */
export default function CandleFlame({
  size = 'md',
  showEmbers,
  interactive = true,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const flameSvgRef = useRef(null);
  const [tiltAngle, setTiltAngle] = useState(0);

  // Default embers: enabled for md and lg
  const embersEnabled = showEmbers !== undefined ? showEmbers : size !== 'sm';

  const sizes = {
    sm: { width: 16, height: 24, canvasW: 40, canvasH: 60, particleCount: 6 },
    md: { width: 24, height: 36, canvasW: 80, canvasH: 110, particleCount: 14 },
    lg: { width: 36, height: 54, canvasW: 110, canvasH: 150, particleCount: 22 },
  };

  const config = sizes[size] || sizes.md;

  // 1. Mouse draft tracking & atmospheric breathing physics
  useEffect(() => {
    if (!interactive) return;

    let targetTilt = 0;
    let currentTilt = 0;
    let breathTime = 0;
    let lastMouseX = null;
    let lastMouseTime = performance.now();
    let animId;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const flameCenterX = rect.left + rect.width / 2;
      const flameCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - flameCenterX;
      const dy = e.clientY - flameCenterY;
      const dist = Math.hypot(dx, dy);

      const now = performance.now();
      const dt = Math.max(16, now - lastMouseTime);
      const mouseSpeedX = lastMouseX !== null ? (e.clientX - lastMouseX) / dt : 0;
      lastMouseX = e.clientX;
      lastMouseTime = now;

      // If cursor is within 350px of flame, react to draft displacement and mouse velocity
      if (dist < 350) {
        const proximityFactor = Math.max(0, 1 - dist / 350);
        // Soft push away from close cursor + lean in direction of cursor wind
        const draftFromSpeed = Math.max(-10, Math.min(10, mouseSpeedX * 8));
        const draftFromProximity = (dx < 0 ? 1 : -1) * (proximityFactor * 4);
        targetTilt = Math.max(-9, Math.min(9, draftFromSpeed * 0.6 + draftFromProximity));
      } else {
        targetTilt = 0;
      }
    };

    const physicsLoop = () => {
      breathTime += 0.03;
      // Gentle natural atmospheric breathing sway (subtle sinusoidal drift)
      const naturalBreathing = Math.sin(breathTime * 1.2) * 1.2 + Math.cos(breathTime * 0.7) * 0.8;

      // Spring damping towards target tilt
      currentTilt += (targetTilt + naturalBreathing - currentTilt) * 0.08;

      if (flameSvgRef.current) {
        flameSvgRef.current.style.transform = `rotate(${currentTilt.toFixed(2)}deg) skewX(${(currentTilt * 0.25).toFixed(2)}deg)`;
      }

      // Slowly decay target tilt back to zero if mouse stops
      targetTilt *= 0.94;
      animId = requestAnimationFrame(physicsLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(physicsLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [interactive]);

  // 2. Living Canvas Ember Particle System
  useEffect(() => {
    if (!embersEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { canvasW, canvasH, particleCount } = config;
    canvas.width = canvasW;
    canvas.height = canvasH;

    // Origin of embers is right at the flame tip/wick area
    const originX = canvasW / 2;
    const originY = canvasH - 24;

    const colors = [
      'rgba(245, 197, 99, ',   // Pale amber
      'rgba(232, 168, 71, ',   // Warm honey
      'rgba(255, 238, 187, ',  // Golden white core
      'rgba(196, 109, 32, ',   // Deep ember
    ];

    const createParticle = () => {
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: originX + (Math.random() - 0.5) * 10,
        y: originY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.45 - Math.random() * 0.65,
        radius: 0.6 + Math.random() * 1.2,
        life: 0,
        maxLife: 60 + Math.random() * 80,
        peakAlpha: 0.35 + Math.random() * 0.55,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        colorPrefix,
      };
    };

    const particles = Array.from({ length: particleCount }, () => {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // Stagger initial ages
      p.y -= Math.random() * (canvasH - 30);
      return p;
    });

    let emberAnimId;

    const render = () => {
      ctx.clearRect(0, 0, canvasW, canvasH);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife || p.y <= 4) {
          particles[i] = createParticle();
          continue;
        }

        // Upward movement with natural air current sway
        p.x += p.vx + Math.sin(p.life * p.swaySpeed + p.swayPhase) * 0.35;
        p.y += p.vy;

        // Alpha calculation: gentle fade in, long glow, smooth fade to smoke
        const progress = p.life / p.maxLife;
        let alpha = 0;
        if (progress < 0.2) {
          alpha = (progress / 0.2) * p.peakAlpha;
        } else {
          alpha = (1 - (progress - 0.2) / 0.8) * p.peakAlpha;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${alpha.toFixed(3)})`;
        ctx.shadowColor = 'rgba(232, 168, 71, 0.4)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }

      emberAnimId = requestAnimationFrame(render);
    };

    emberAnimId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(emberAnimId);
    };
  }, [embersEnabled, config]);

  return (
    <div
      ref={containerRef}
      className={`candle-flame candle-flame--${size} ${className}`}
      data-testid="candle-flame"
    >
      {/* Living Ember Canvas floating above & around the candle */}
      {embersEnabled && (
        <canvas
          ref={canvasRef}
          className="candle-flame__canvas"
          aria-hidden="true"
        />
      )}

      {/* Ambient glow behind the flame */}
      <div className="candle-flame__glow" />

      {/* The living SVG flame with responsive breeze physics */}
      <svg
        ref={flameSvgRef}
        className="candle-flame__svg"
        width={config.width}
        height={config.height}
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
