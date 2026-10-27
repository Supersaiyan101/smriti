import { useState, useRef, useEffect } from 'react';
import './VoicePlayer.css';

/**
 * VoicePlayer — Screen-off audio listener component.
 * Streams speech from ElevenLabs TTS or falls back smoothly
 * to gentle native speech synthesis.
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
    setIsPlaying(false);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    // If we already have the ElevenLabs audio blob, resume playback
    if (audioRef.current && audioUrl) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Audio play error:', e);
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
          setIsPlaying(false);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };

        await audio.play();
        setIsPlaying(true);
      } else {
        // Fallback: Web Speech API
        const data = await res.json();
        const cleanText = data.text || text.replace(/\[.*?\]/g, '');

        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.rate = 0.88; // Gentle, calm pacing
          utterance.pitch = 0.95; // Warm, dignified pitch

          // Pick natural English voice if available
          const voices = window.speechSynthesis.getVoices();
          const warmVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Serena')));
          if (warmVoice) utterance.voice = warmVoice;

          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);

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
          <span className="voice-wave__hint">Sit quietly and listen</span>
        </div>
      )}
    </div>
  );
}
