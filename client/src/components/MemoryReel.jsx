import { useState, useEffect, useRef } from 'react';
import CandleFlame from './CandleFlame';
import HeirloomLightbox from './HeirloomLightbox';
import './MemoryReel.css';

/**
 * MemoryReel — The Flagship Sanctuary Experience.
 * "A cinematic story reel of their life, set to their music."
 * 
 * Features:
 *  - Layout A: Cinematic Split (Breathing Archival Photo + Quiet Heartfelt Story)
 *  - Spotify Wrapped-style top segmented progress bars
 *  - Soundtrack engine: plays uploaded song MP3 or procedural sanctuary instrumentals
 *  - Read-only reverent dignity (no robotic AI voices)
 *  - Ken Burns slow photographic drift & candlelight bounce reflection
 * 
 * @param {Object} props
 * @param {Object} props.profile - Person being remembered
 * @param {Array} props.slides - Array of photo story slides
 * @param {Object} [props.soundtrack] - Soundtrack config ({ title, url, presetType })
 * @param {Function} props.onClose - Close callback
 */
export default function MemoryReel({ profile, slides = [], soundtrack = null, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 for current segment
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const [imageFitMode, setImageFitMode] = useState('contain'); // 'contain' (never cuts images) | 'cover'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const synthTimerRef = useRef(null);
  const slideDuration = 11000; // 11s per memory slide

  // Preload adjacent slides for seamless, flicker-free transitions
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const nextIdx = (currentIndex + 1) % slides.length;
    const prevIdx = (currentIndex - 1 + slides.length) % slides.length;
    [nextIdx, prevIdx].forEach((idx) => {
      const s = slides[idx];
      if (s && s.mediaUrl && s.type !== 'video') {
        const img = new Image();
        img.src = s.mediaUrl;
      }
    });
  }, [currentIndex, slides]);

  // Keyboard navigation (Esc to exit, Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length]);

  // Story Progress Bar Engine (Spotify Wrapped-style timeline)
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const intervalTime = 50; // Update progress every 50ms
    const step = (intervalTime / slideDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, slides.length]);

  const goToNextSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const jumpToSlide = (idx) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  // -------------------------------------------------------------
  // Soundtrack Audio Engine (Uploaded Song OR Procedural Melody)
  // -------------------------------------------------------------
  useEffect(() => {
    const track = soundtrack || profile?.soundtrack;
    if (!track || track.presetType === 'none') return;

    if (track.url) {
      // 1. Uploaded Audio File (MP3 / Audio)
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : musicVolume;
      audioRef.current = audio;

      audio.play().catch(() => {
        // Autoplay policy fallback: waiting for user gesture
      });

      return () => {
        audio.pause();
        audio.src = '';
      };
    } else {
      // 2. Procedural Sanctuary Acoustic Instrumentals
      startProceduralSoundtrack(track.presetType || 'piano_dusk');
      return () => {
        stopProceduralSoundtrack();
      };
    }
  }, [soundtrack, profile?.soundtrack]);

  // Update volume on audio elements
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : musicVolume;
    }
  }, [isMuted, musicVolume]);

  const startProceduralSoundtrack = (presetKey) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : musicVolume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Chords based on preset
      const scales = {
        piano_dusk: [220, 261.63, 293.66, 329.63, 392, 440, 523.25], // A minor / C major peaceful
        classical_sarod: [146.83, 164.81, 185, 220, 246.94, 293.66], // Raag Yaman meditative
        acoustic_strings: [196, 246.94, 293.66, 392, 493.88], // G major gentle acoustic
        rain_chimes: [329.63, 392, 440, 523.25, 659.25], // Wind chime pentatonic
      };

      const notes = scales[presetKey] || scales.piano_dusk;

      // Play soft meditative arpeggiated tones
      const playTone = () => {
        if (!ctx || ctx.state === 'closed') return;
        const freq = notes[Math.floor(Math.random() * notes.length)];
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start();
        osc.stop(ctx.currentTime + 3.3);

        synthTimerRef.current = setTimeout(playTone, 1400 + Math.random() * 1800);
      };

      playTone();
    } catch {
      // Audio autoplay policy
    }
  };

  const stopProceduralSoundtrack = () => {
    if (synthTimerRef.current) clearTimeout(synthTimerRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="memory-reel-overlay fade-in">
        <div className="reel-empty-sanctuary">
          <CandleFlame size="lg" />
          <h2>The Memory Reel is Waiting</h2>
          <p>No photographs have been placed in {profile.name}'s reel yet.</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            ← Return to Sanctuary
          </button>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const activeTrackTitle =
    soundtrack?.title || profile?.soundtrack?.title || 'Sanctuary Ambient Harmony';

  return (
    <div className="memory-reel-overlay fade-in">
      {/* -------------------------------------------------------------
          1. Top Spotify Wrapped-Style Segmented Story Timeline
          ------------------------------------------------------------- */}
      <div className="reel-top-bar">
        <div className="reel-progress-timeline" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={slides.length}>
          {slides.map((_, idx) => {
            let fillPct = 0;
            if (idx < currentIndex) fillPct = 100;
            else if (idx === currentIndex) fillPct = progress;

            return (
              <div
                key={idx}
                className="reel-timeline-segment"
                onClick={() => jumpToSlide(idx)}
                title={`Jump to Moment ${idx + 1}`}
              >
                <div
                  className="reel-timeline-fill"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header Controls: Music Badge + Exit */}
        <div className="reel-header-controls">
          {/* Spotify / Audio Soundtrack Pill */}
          <div className="reel-soundtrack-badge" title="Soundtrack playing softly">
            <span className={`vinyl-disc ${isPlaying && !isMuted ? 'vinyl-disc--spinning' : ''}`}>
              💿
            </span>
            <span className="soundtrack-name">{activeTrackTitle}</span>
            {soundtrack?.spotifyTrackId ? (
              <a
                href={soundtrack.spotifyUrl || `https://open.spotify.com/track/${soundtrack.spotifyTrackId}`}
                target="_blank"
                rel="noreferrer"
                className="soundtrack-spotify-link"
                title="Open track on Spotify"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Spotify ↗</span>
              </a>
            ) : (
              <button
                type="button"
                className="soundtrack-mute-btn"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? 'Unmute music' : 'Mute music'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            )}
          </div>

          <button
            type="button"
            className="reel-exit-btn"
            onClick={onClose}
            aria-label="Exit Memory Reel"
            title="Exit Memory Reel (Esc)"
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. Layout A: Cinematic Split Altar
          ------------------------------------------------------------- */}
      <main className="reel-cinema-split">
        {/* Left: Breathing Heirloom Photograph or Video */}
        <section className="reel-photo-side">
          <div
            className="reel-photo-frame reel-photo-frame--interactive"
            onClick={() => {
              setIsPlaying(false);
              setIsLightboxOpen(true);
            }}
            title="Click to view full photograph"
          >
            {/* Ambient Blurred Aura matching photo colors so uncropped photo never looks bare */}
            {currentSlide.mediaUrl && currentSlide.type !== 'video' && (
              <div
                className="reel-photo-backdrop"
                style={{ backgroundImage: `url(${currentSlide.mediaUrl})` }}
                aria-hidden="true"
              />
            )}

            {currentSlide.type === 'video' ? (
              <video
                key={currentSlide._id || currentIndex}
                src={currentSlide.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className={`reel-breathing-photo reel-video-player fit-${imageFitMode}`}
              />
            ) : (
              <img
                key={currentSlide._id || currentIndex}
                src={currentSlide.mediaUrl}
                alt={currentSlide.sourceLabel || 'Memory Moment'}
                className={`reel-breathing-photo fit-${imageFitMode}`}
              />
            )}
            {/* Ambient Candlelight Bounce Glass Reflection */}
            <div className="reel-glass-reflection" aria-hidden="true" />

            {/* Living Flame resting in the corner of the frame */}
            <div className="reel-corner-flame">
              <CandleFlame size="sm" />
            </div>

            {/* Fit / Fill Toggle */}
            <button
              type="button"
              className="reel-fit-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setImageFitMode((prev) => (prev === 'contain' ? 'cover' : 'contain'));
              }}
              title={imageFitMode === 'contain' ? 'Expand to fill frame' : 'Show full uncropped photo'}
            >
              <span>{imageFitMode === 'contain' ? '⛶ Fill' : '⊡ Full'}</span>
            </button>
          </div>
        </section>

        {/* Right: The Quiet Heartfelt Written Story */}
        <section className="reel-story-side">
          <div
            className="reel-story-card fade-in"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
            title="Hovering pauses slideshow"
          >
            {/* Spacetime Pinning */}
            <div className="reel-spacetime-badge">
              {currentSlide.timePlace?.when && (
                <span className="spacetime-item">🗓️ {currentSlide.timePlace.when}</span>
              )}
              {currentSlide.timePlace?.when && currentSlide.timePlace?.where && (
                <span className="spacetime-sep">•</span>
              )}
              {currentSlide.timePlace?.where && (
                <span className="spacetime-item">📍 {currentSlide.timePlace.where}</span>
              )}
              {!currentSlide.timePlace?.when && !currentSlide.timePlace?.where && (
                <span className="spacetime-item">🕯️ Cherished Remembrance</span>
              )}
            </div>

            {/* Moment Title */}
            <h2 className="reel-moment-title">
              {currentSlide.sourceLabel || `Moment #${currentIndex + 1}`}
            </h2>

            {/* The Heartfelt Written Narrative */}
            <blockquote className="reel-story-prose">
              "{currentSlide.content}"
            </blockquote>

            <p className="reel-person-dedication">
              Carried in living memory of {profile.name}
            </p>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------
          3. Bottom Navigation Bar
          ------------------------------------------------------------- */}
      <footer className="reel-bottom-nav">
        <button
          type="button"
          className="reel-nav-btn"
          onClick={goToPrevSlide}
          aria-label="Previous moment"
        >
          <span>‹</span>
          <span className="nav-btn-text">Previous</span>
        </button>

        <div className="reel-center-controls">
          <button
            type="button"
            className="reel-play-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
          </button>
          <span className="reel-slide-counter">
            Moment {currentIndex + 1} of {slides.length}
          </span>
        </div>

        <button
          type="button"
          className="reel-nav-btn"
          onClick={goToNextSlide}
          aria-label="Next moment"
        >
          <span className="nav-btn-text">Next</span>
          <span>›</span>
        </button>
      </footer>

      {/* Lightbox for inspecting the full uncropped photograph */}
      <HeirloomLightbox
        isOpen={isLightboxOpen}
        mediaUrl={currentSlide.mediaUrl}
        title={currentSlide.sourceLabel || `Moment #${currentIndex + 1}`}
        subtitle={[currentSlide.timePlace?.when, currentSlide.timePlace?.where].filter(Boolean).join(' • ') || `Memory of ${profile.name}`}
        caption={currentSlide.content}
        isVideo={currentSlide.type === 'video'}
        onClose={() => {
          setIsLightboxOpen(false);
          setIsPlaying(true);
        }}
      />
    </div>
  );
}
