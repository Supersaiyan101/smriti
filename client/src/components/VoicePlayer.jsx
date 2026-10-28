import { useState, useRef, useEffect, useCallback } from 'react';
import './VoicePlayer.css';

/**
 * VoicePlayer — Screen-off audio listener component.
 * Features:
 *  - Studio Audio Ducking (dispatches 'smriti-voice-playing' event to fade background music)
 *  - Analog Warmth Filter (gentle lowpass at 6800Hz + vocal presence boost at 2400Hz)
 *  - ElevenLabs Studio TTS streaming with real emotional human cadence
 *  - Intelligent Natural Neural voice selector fallback (skips robotic legacy desktop voices)
 *  - Sentence-by-sentence human breathing engine with natural cadence pauses
 * 
 * @param {Object} props
 * @param {string} props.text - The remembrance response to read aloud
 */
export default function VoicePlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voiceProvider, setVoiceProvider] = useState('');
  const [cachedVoices, setCachedVoices] = useState([]);

  const audioRef = useRef(null);
  const voiceAudioCtxRef = useRef(null);
  const audioSourceNodeRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Eagerly cache system voices and listen to dynamic voice loading
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setCachedVoices(voices);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Broadcast voice state to ambient soundscape for studio ducking
  const notifyVoiceState = useCallback((playing) => {
    setIsPlaying(playing);
    try {
      window.dispatchEvent(
        new CustomEvent('smriti-voice-playing', { detail: { isPlaying: playing } })
      );
    } catch {}
  }, []);

  const stopAllAudio = useCallback(() => {
    isCancelledRef.current = true;
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    notifyVoiceState(false);
  }, [notifyVoiceState]);

  // Stop playback on unmount or when text changes
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [text, stopAllAudio]);

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

  /**
   * Intelligently selects modern Natural / Neural voices,
   * actively prioritizing warm human voices over robotic legacy desktop engines.
   */
  const getBestNaturalVoice = () => {
    const voices = cachedVoices.length > 0 ? cachedVoices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    // 1. Microsoft Online Natural Neural voices (Top tier realism on Windows & Edge)
    const tier1 = pool.find(v => 
      /online.*natural/i.test(v.name) ||
      /natural.*english/i.test(v.name) ||
      /Jenny.*Online/i.test(v.name) ||
      /Aria.*Online/i.test(v.name) ||
      /Guy.*Online/i.test(v.name)
    );
    if (tier1) return tier1;

    // 2. Google Neural / Cloud voices (Very smooth in Chrome / Brave)
    const tier2 = pool.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Google UK English Male')
    );
    if (tier2) return tier2;

    // 3. Apple Warm Natural voices (macOS / iOS)
    const tier3 = pool.find(v =>
      /Samantha/i.test(v.name) ||
      /Serena/i.test(v.name) ||
      /Karen/i.test(v.name) ||
      /Daniel/i.test(v.name) ||
      /Moira/i.test(v.name)
    );
    if (tier3) return tier3;

    // 4. Any voice that does NOT contain "Desktop" (skipping 2000s robotic Windows TTS)
    const nonDesktop = pool.find(v => !/desktop/i.test(v.name) && !/David/i.test(v.name));
    if (nonDesktop) return nonDesktop;

    // 5. Microsoft Zira (softer and less mechanical than David)
    const zira = pool.find(v => /Zira/i.test(v.name));
    if (zira) return zira;

    return pool[0] || null;
  };

  /**
   * Plays sentences with natural breath pauses (~320ms) between thoughts
   * to eliminate robotic monotonic speed reading.
   */
  const playSentencesWithBreathing = (fullCleanText) => {
    isCancelledRef.current = false;
    const voice = getBestNaturalVoice();
    if (voice) {
      setVoiceProvider(voice.name.replace(/Microsoft |Online |Desktop |- English.*$/gi, '').trim() || 'Natural Voice');
    } else {
      setVoiceProvider('Natural Voice');
    }

    // Split text into coherent clauses/sentences on punctuation
    const rawSentences = fullCleanText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (rawSentences.length === 0) return;

    let index = 0;
    notifyVoiceState(true);

    const speakNextSentence = () => {
      if (isCancelledRef.current || index >= rawSentences.length) {
        notifyVoiceState(false);
        return;
      }

      const sentenceText = rawSentences[index];
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      if (voice) utterance.voice = voice;

      // Pacing for sacred, thoughtful remembrance
      utterance.rate = 0.90; // Calm, respectful pace
      utterance.pitch = 0.98; // Natural tone, avoids artificial shrillness

      utterance.onend = () => {
        if (isCancelledRef.current) return;
        index++;
        if (index < rawSentences.length) {
          // Human breathing pause between sentences (320ms)
          pauseTimerRef.current = setTimeout(speakNextSentence, 320);
        } else {
          notifyVoiceState(false);
        }
      };

      utterance.onerror = (e) => {
        console.warn('Utterance notice:', e);
        notifyVoiceState(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    speakNextSentence();
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    // If we already have the ElevenLabs audio element, resume playback
    if (audioRef.current && audioUrl) {
      try {
        isCancelledRef.current = false;
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
        setVoiceProvider('ElevenLabs Studio AI');

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          notifyVoiceState(false);
        };
        audio.onerror = () => {
          notifyVoiceState(false);
          setIsLoading(false);
        };

        isCancelledRef.current = false;
        applyAnalogWarmth(audio);
        await audio.play();
        notifyVoiceState(true);
      } else {
        // Natural speech synthesis engine with human breathing
        const data = await res.json();
        const cleanText = data.text || text
          .replace(/\[.*?\]/g, '')
          .replace(/^Looking back at what.*?left with you:\s*/i, '')
          .replace(/They also shared:\s*/gi, '')
          .replace(/These words remain rooted and true\.?/gi, '')
          .replace(/["“”'‘’]/g, '')
          .trim();

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          playSentencesWithBreathing(cleanText);
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

      {/* Gentle living audio wave bars & active engine badge */}
      {isPlaying && (
        <div className="voice-wave">
          <span className="voice-wave__bar bar-1" />
          <span className="voice-wave__bar bar-2" />
          <span className="voice-wave__bar bar-3" />
          <span className="voice-wave__bar bar-4" />
          <span className="voice-wave__bar bar-5" />
          <span className="voice-wave__hint">
            {voiceProvider === 'ElevenLabs Studio AI'
              ? '✨ ElevenLabs Studio • Analog Warmth Active • Ambient Ducked'
              : `🎙️ ${voiceProvider} • Natural Cadence • Ambient Ducked`}
          </span>
        </div>
      )}
    </div>
  );
}
