import { useState, useEffect, useRef } from 'react';
import './AmbientSoundscape.css';

/**
 * AmbientSoundscape — Generative Web Audio API soundscape generator.
 * Features:
 *  - Studio Audio Ducking (automatically ducks volume by 65% when VoicePlayer speaks)
 *  - Procedural pink/brown noise rain, breeze, and warm tape hiss
 *  - Zero external assets or bandwidth consumed
 */
export default function AmbientSoundscape() {
  const [mode, setMode] = useState('off'); // 'off' | 'rain' | 'breeze' | 'tape'
  const [volume, setVolume] = useState(0.25);
  const [isOpen, setIsOpen] = useState(false);
  const [isDucked, setIsDucked] = useState(false);

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const activeSourcesRef = useRef([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Studio Audio Ducking Listener: ducks when voice speaks, swells back when finished
  useEffect(() => {
    const handleVoiceState = (e) => {
      setIsDucked(!!e.detail?.isPlaying);
    };

    window.addEventListener('smriti-voice-playing', handleVoiceState);
    return () => window.removeEventListener('smriti-voice-playing', handleVoiceState);
  }, []);

  // Update volume with smooth crossfades and ducking support
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const baseVol = mode === 'off' ? 0 : volume;
      // Duck by ~65% when voice is active
      const targetGain = isDucked ? baseVol * 0.32 : baseVol;
      const rampTime = isDucked ? 0.25 : 0.8; // Duck promptly, swell back softly

      gainNodeRef.current.gain.setTargetAtTime(
        targetGain,
        audioCtxRef.current.currentTime,
        rampTime
      );
    }
  }, [volume, mode, isDucked]);

  const initContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const masterGain = audioCtxRef.current.createGain();
      masterGain.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      masterGain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = masterGain;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const intervalTimerRef = useRef(null);

  const stopCurrentSound = () => {
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
  };

  const startSound = (soundType) => {
    initContext();
    stopCurrentSound();

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (soundType === 'off') {
      setMode('off');
      return;
    }

    if (soundType === 'chimes') {
      // 🎐 Pure Sanctuary Temple Chimes (432Hz harmonic pentatonic bells)
      const chimeFreqs = [432, 540, 648, 864, 972];
      const ringChime = () => {
        if (!ctx || ctx.state === 'closed') return;
        const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 4.5);

        osc.connect(chimeGain);
        chimeGain.connect(gainNodeRef.current);

        osc.start();
        osc.stop(ctx.currentTime + 4.6);
      };

      ringChime();
      intervalTimerRef.current = setInterval(ringChime, 3200);
    } else if (soundType === 'rain') {
      // 🌧️ Gentle Rain Drops (warm sine-based droplets, zero radio hiss)
      const dropFreqs = [800, 1100, 1400, 950, 1250];
      const playDrop = () => {
        if (!ctx || ctx.state === 'closed') return;
        const freq = dropFreqs[Math.floor(Math.random() * dropFreqs.length)];
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.12);

        dropGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        dropGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.015);
        dropGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.12);

        osc.connect(dropGain);
        dropGain.connect(gainNodeRef.current);

        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      };

      playDrop();
      intervalTimerRef.current = setInterval(() => {
        playDrop();
        if (Math.random() > 0.4) setTimeout(playDrop, 80 + Math.random() * 120);
      }, 260);
    } else if (soundType === 'breeze') {
      // 🌙 Night Breeze (warm, sacred low drone pad at 108Hz and 216Hz, zero noise)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(108, ctx.currentTime); // Sacred sub-octave

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(216, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.001, ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(gainNodeRef.current);

      osc1.start();
      osc2.start();
      activeSourcesRef.current.push(osc1, osc2);
    }

    setMode(soundType);
  };

  const modeLabels = {
    off: 'Room Silence',
    chimes: '🎐 Temple Chimes',
    rain: '🌧️ Gentle Drops',
    breeze: '🌙 Night Breeze',
  };

  return (
    <div className="ambient-soundscape">
      <button
        type="button"
        className={`ambient-toggle-btn ${mode !== 'off' ? 'ambient-toggle-btn--active' : ''} ${isDucked ? 'ambient-toggle-btn--ducked' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Sanctuary Ambient Audio"
      >
        <span className="ambient-icon">
          {mode === 'off' ? '🔇' : mode === 'chimes' ? '🎐' : mode === 'rain' ? '🌧️' : '🌙'}
        </span>
        <span className="ambient-label">
          {mode === 'off' ? 'Quiet Room' : isDucked ? `${modeLabels[mode]} (Ducked)` : modeLabels[mode]}
        </span>
      </button>

      {isOpen && (
        <div className="ambient-popover fade-in-up">
          <div className="ambient-popover__header">
            <span className="popover-title">Sanctuary Atmosphere</span>
            <button
              type="button"
              className="popover-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <p className="popover-hint">
            Gentle acoustic presence for sitting quietly with memories. Automatically ducks when voice speaks.
          </p>

          <div className="ambient-modes">
            <button
              type="button"
              className={`mode-btn ${mode === 'off' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('off')}
            >
              🔇 Silence
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'chimes' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('chimes')}
            >
              🎐 Temple Chimes
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'rain' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('rain')}
            >
              🌧️ Gentle Drops
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'breeze' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('breeze')}
            >
              🌙 Night Breeze
            </button>
          </div>

          {mode !== 'off' && (
            <div className="ambient-volume-row">
              <span className="volume-label">Presence</span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="ambient-slider"
              />
            </div>
          )}

          {isDucked && mode !== 'off' && (
            <div className="ambient-ducking-indicator">
              <span>✦ Studio ducking active for spoken voice</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
