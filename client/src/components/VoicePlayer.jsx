import { useState, useRef, useEffect } from 'react';
import './VoicePlayer.css';

/**
 * VoicePlayer — Screen-off audio listener component.
 * Features:
 *  - Studio Audio Ducking (dispatches 'smriti-voice-playing' event)
 *  - Analog Warmth Filter (gentle lowpass at 6800Hz + vocal presence boost)
 *  - Streams speech from ElevenLabs TTS or falls back to Web Speech API
 * 
 * @param {Object} props
 * @param {string} props.text - The remembrance response to read aloud
 */
export default function VoicePlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const voiceAudioCtxRef = useRef(null);
  const audioSourceNodeRef = useRef(null);

  // Broadcast voice state to ambient soundscape for studio ducking
  const notifyVoiceState = (playing) => {
    setIsPlaying(playing);
    try {
      window.dispatchEvent(
        new CustomEvent('smriti-voice-playing', { detail: { isPlaying: playing } })
      );
    } catch {}
  };

  // Stop playback on unmount or when text changes
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [text]);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    notifyVoiceState(false);
  };

  // Route HTML5 audio through Web Audio API analog warmth filter
  const applyAnalogWarmth = (audioEl) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!voiceAudioCtxRef.current) {
          voiceAudioCtxRef.current = new AudioCtx();
        }
        const ctx = voiceAudioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        if (!audioSourceNodeRef.current) {
          const source = ctx.createMediaElementSource(audioEl);

          // Low-pass filter at 6800Hz removes digital harshness / sibilance
          const lowPass = ctx.createBiquadFilter();
          lowPass.type = 'lowpass';
          lowPass.frequency.setValueAtTime(6800, ctx.currentTime);

          // Vocal warmth boost around 2400Hz
          const warmth = ctx.createBiquadFilter();
          warmth.type = 'peaking';
          warmth.frequency.setValueAtTime(2400, ctx.currentTime);
          warmth.gain.setValueAtTime(1.5, ctx.currentTime);

          source.connect(warmth);
          warmth.connect(lowPass);
          lowPass.connect(ctx.destination);
          audioSourceNodeRef.current = source;
        }
      }
    } catch {
      // In case element is already connected or browser restricts
    }
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    // If we already have the ElevenLabs audio element, resume playback
    if (audioRef.current && audioUrl) {
      try {
        applyAnalogWarmth(audioRef.current);
        await audioRef.current.play();
        notifyVoiceState(true);
      } catch (e) {
        console.warn('Audio resume error:', e);
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('audio/mpeg') || contentType.includes('audio/')) {
        // Direct ElevenLabs audio stream received
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          notifyVoiceState(false);
        };
        audio.onerror = () => {
          notifyVoiceState(false);
          setIsLoading(false);
        };

        applyAnalogWarmth(audio);
        await audio.play();
        notifyVoiceState(true);
      } else {
        // Fallback: Web Speech API
        const data = await res.json();
        const cleanText = data.text || text.replace(/\[.*?\]/g, '');

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 0.88; // Gentle, calm pacing
          utterance.pitch = 0.94; // Warm, thoughtful pitch

          // Pick natural English voice if available
          const voices = window.speechSynthesis.getVoices();
          const warmVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Samantha') ||
                v.name.includes('Serena') ||
                v.name.includes('Google UK English Female'))
          );
          if (warmVoice) utterance.voice = warmVoice;

          utterance.onstart = () => notifyVoiceState(true);
          utterance.onend = () => notifyVoiceState(false);
          utterance.onerror = () => notifyVoiceState(false);

          utteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          alert('Audio speech playback not supported in this browser.');
        }
      }
    } catch (err) {
      console.warn('Voice generation notice:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`voice-player ${isPlaying ? 'voice-player--playing' : ''}`}>
      <button
        type="button"
        className="btn btn-ghost btn-sm voice-player__btn"
        onClick={handleTogglePlay}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause speech' : 'Listen with eyes closed'}
      >
        <span className="voice-player__icon">
          {isLoading ? '⏳' : isPlaying ? '⏸️' : '🔊'}
        </span>
        <span className="voice-player__label">
          {isLoading
            ? 'Preparing voice...'
            : isPlaying
            ? 'Speaking softly (Pause)'
            : 'Listen with eyes closed'}
        </span>
      </button>

      {/* Gentle living audio wave bars */}
      {isPlaying && (
        <div className="voice-wave">
          <span className="voice-wave__bar bar-1" />
          <span className="voice-wave__bar bar-2" />
          <span className="voice-wave__bar bar-3" />
          <span className="voice-wave__bar bar-4" />
          <span className="voice-wave__bar bar-5" />
          <span className="voice-wave__hint">Analog warmth active • Ambient ducked</span>
        </div>
      )}
    </div>
  );
}
