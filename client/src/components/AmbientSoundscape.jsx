import { useState, useEffect, useRef } from 'react';
import './AmbientSoundscape.css';

/**
 * AmbientSoundscape — Generative Web Audio API soundscape generator.
 * Zero external audio downloads; procedural soothing acoustic sanctuary presence.
 * Modes: Rain on Window, Night Breeze, Warm Tape Hiss, or Silent.
 */
export default function AmbientSoundscape() {
  const [mode, setMode] = useState('off'); // 'off' | 'rain' | 'breeze' | 'tape'
  const [volume, setVolume] = useState(0.25);
  const [isOpen, setIsOpen] = useState(false);

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

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        mode === 'off' ? 0 : volume,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, mode]);

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

  const stopCurrentSound = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
  };

  const createNoiseBuffer = (ctx, seconds = 4) => {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    // Pink / brown noise generator for natural rain/wind texture
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain boost
    }
    return buffer;
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

    const noiseBuffer = createNoiseBuffer(ctx, 4);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    if (soundType === 'rain') {
      // Gentle Rain: Low-pass filter + subtle droplet variations
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNodeRef.current);
      noiseSource.start();
      activeSourcesRef.current.push(noiseSource);
    } else if (soundType === 'breeze') {
      // Night Breeze: Deep resonant bandpass
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNodeRef.current);
      noiseSource.start();
      activeSourcesRef.current.push(noiseSource);
    } else if (soundType === 'tape') {
      // Warm Tape Hiss: High-pass + slight warm hum
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      // Low 50Hz hum
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNodeRef.current);

      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);

      noiseSource.start();
      osc.start();
      activeSourcesRef.current.push(noiseSource, osc);
    }

    setMode(soundType);
  };

  const modeLabels = {
    off: 'Room Silence',
    rain: '🌧️ Rain on Window',
    breeze: '🌙 Night Breeze',
    tape: '📻 Warm Tape Hiss',
  };

  return (
    <div className="ambient-soundscape">
      <button
        type="button"
        className={`ambient-toggle-btn ${mode !== 'off' ? 'ambient-toggle-btn--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Sanctuary Ambient Audio"
      >
        <span className="ambient-icon">
          {mode === 'off' ? '🔇' : mode === 'rain' ? '🌧️' : mode === 'breeze' ? '🌙' : '📻'}
        </span>
        <span className="ambient-label">{mode === 'off' ? 'Quiet Room' : modeLabels[mode]}</span>
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
            Gentle acoustic presence for sitting quietly with memories.
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
              className={`mode-btn ${mode === 'rain' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('rain')}
            >
              🌧️ Rain on Window
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'breeze' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('breeze')}
            >
              🌙 Night Breeze
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'tape' ? 'mode-btn--active' : ''}`}
              onClick={() => startSound('tape')}
            >
              📻 Tape Hiss
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
        </div>
      )}
    </div>
  );
}
