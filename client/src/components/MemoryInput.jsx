import { useState, useRef } from 'react';
import './MemoryInput.css';

/**
 * MemoryInput — Multimodal memory collector:
 * 1. Written memory / quotes
 * 2. In-browser audio recording via MediaRecorder API
 * 3. Photo or handwritten letter attachment
 */
export default function MemoryInput({
  textContent,
  setTextContent,
  audioBlob,
  setAudioBlob,
  photoFile,
  setPhotoFile,
  sensory = { weather: '', scent: '', song: '' },
  setSensory,
}) {
  const [showSensory, setShowSensory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // --- Voice Recording ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err.message);
      alert('Could not access microphone. You can still type their memories or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordSeconds(0);
  };

  // --- Photo Upload ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="memory-input">
      {/* Written Memory Area */}
      <div className="memory-input__text-section">
        <label htmlFor="memory-text" className="memory-input__label">
          A memory, a story, or words they often said:
        </label>
        <textarea
          id="memory-text"
          className="memory-input__textarea"
          rows={4}
          placeholder="Write down something small they said, a quiet moment you shared, or advice they gave you..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
        />
      </div>

      {/* Multimodal Actions (Voice & Photo) */}
      <div className="memory-input__actions">
        {/* Audio Recording */}
        {!audioBlob && !isRecording && (
          <button
            type="button"
            className="btn btn-ghost memory-action-btn"
            onClick={startRecording}
          >
            <span>🎙️</span>
            <span>Record Voice Note</span>
          </button>
        )}

        {isRecording && (
          <div className="memory-input__recording-state">
            <span className="recording-pulse" />
            <span className="recording-timer">Recording: {formatTime(recordSeconds)}</span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={stopRecording}
            >
              Done
            </button>
          </div>
        )}

        {audioBlob && (
          <div className="memory-input__audio-preview">
            <span className="audio-badge">🎤 Voice fragment saved</span>
            <audio controls src={audioUrl} className="audio-player" />
            <button
              type="button"
              className="btn-icon-discard"
              onClick={discardAudio}
              title="Discard voice recording"
            >
              ✕
            </button>
          </div>
        )}

        {/* Photo Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />

        {!photoPreview && (
          <button
            type="button"
            className="btn btn-ghost memory-action-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <span>📷</span>
            <span>Attach Portrait or Letter</span>
          </button>
        )}

        {photoPreview && (
          <div className="memory-input__photo-preview">
            <img src={photoPreview} alt="Uploaded preview" />
            <button
              type="button"
              className="btn-icon-discard"
              onClick={removePhoto}
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sensory Anchor Toggle */}
        <button
          type="button"
          className={`btn btn-ghost memory-action-btn ${showSensory ? 'memory-action-btn--active' : ''}`}
          onClick={() => setShowSensory(!showSensory)}
        >
          <span>🌿</span>
          <span>{showSensory ? 'Sensory Anchors (open)' : 'Add Sensory Anchors (Rain, Scent, Song)'}</span>
        </button>
      </div>

      {/* Sensory Anchor Inputs */}
      {showSensory && setSensory && (
        <div className="sensory-anchors-box fade-in">
          <p className="sensory-hint">Ground this memory in physical reality (optional):</p>
          <div className="sensory-grid">
            <div className="sensory-field">
              <label>🌧️ Weather / Season</label>
              <input
                type="text"
                placeholder="e.g. Rainy Tuesday evening"
                value={sensory.weather || ''}
                onChange={(e) => setSensory({ ...sensory, weather: e.target.value })}
              />
            </div>
            <div className="sensory-field">
              <label>☕ Scent / Taste</label>
              <input
                type="text"
                placeholder="e.g. Cardamom chai, old books"
                value={sensory.scent || ''}
                onChange={(e) => setSensory({ ...sensory, scent: e.target.value })}
              />
            </div>
            <div className="sensory-field">
              <label>🎵 Song / Sound</label>
              <input
                type="text"
                placeholder="e.g. Mohit Chauhan in car"
                value={sensory.song || ''}
                onChange={(e) => setSensory({ ...sensory, song: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
