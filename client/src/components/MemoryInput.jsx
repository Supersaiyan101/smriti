import { useState, useRef } from 'react';
import './MemoryInput.css';

/**
 * MemoryInput — Archival Linen Journal & Multimodal Memory Collector:
 * 1. Linen Journal Page (rich serif script, warm ink feel)
 * 2. Time & Place Pinning ("When was this?", "Where were you?")
 * 3. Physical Sensory Anchors (Weather, Scent, Song)
 * 4. Audio Voice Recording via MediaRecorder API
 * 5. Archival Photo / Handwritten Letter attachment
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
  timePlace = { when: '', where: '' },
  setTimePlace,
}) {
  const [showAnchors, setShowAnchors] = useState(false);
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
      {/* Archival Linen Journal Sheet */}
      <div className="linen-journal-card">
        <div className="linen-journal-header">
          <span className="linen-journal-watermark">ARCHIVAL REMEMBRANCE • LINEN LEAF</span>
          <span className="linen-journal-rule" />
        </div>

        {/* Written Recollection */}
        <div className="memory-input__text-section">
          <label htmlFor="memory-text" className="memory-input__label">
            Words, advice, or a quiet moment they left with you:
          </label>
          <div className="journal-textarea-wrapper">
            <div className="journal-margin-line" aria-hidden="true" />
            <textarea
              id="memory-text"
              className="memory-input__textarea journal-script-input"
              rows={5}
              placeholder="Write down something small they said, a habit they had, or a quiet memory you never want to lose..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>
        </div>

        {/* Spacetime Pinning: When & Where */}
        <div className="journal-pinning-row">
          <div className="pinning-field">
            <span className="pinning-icon">🗓️</span>
            <div className="pinning-body">
              <label htmlFor="memory-when">When was this?</label>
              <input
                id="memory-when"
                type="text"
                placeholder="e.g. Winter 2018, or After Diwali"
                value={timePlace?.when || ''}
                onChange={(e) =>
                  setTimePlace && setTimePlace({ ...timePlace, when: e.target.value })
                }
                className="pinning-input"
              />
            </div>
          </div>

          <div className="pinning-field">
            <span className="pinning-icon">📍</span>
            <div className="pinning-body">
              <label htmlFor="memory-where">Where were you?</label>
              <input
                id="memory-where"
                type="text"
                placeholder="e.g. Kitchen table in Shimla"
                value={timePlace?.where || ''}
                onChange={(e) =>
                  setTimePlace && setTimePlace({ ...timePlace, where: e.target.value })
                }
                className="pinning-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Multimodal & Sensory Actions */}
      <div className="memory-input__actions">
        {/* Audio Recording */}
        {!audioBlob && !isRecording && (
          <button
            type="button"
            className="btn btn-ghost memory-action-btn"
            onClick={startRecording}
          >
            <span>🎙️</span>
            <span>Record Spoken Voice</span>
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
            <span>Attach Photo or Handwritten Letter</span>
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

        {/* Sensory Anchors Toggle */}
        <button
          type="button"
          className={`btn btn-ghost memory-action-btn ${showAnchors ? 'memory-action-btn--active' : ''}`}
          onClick={() => setShowAnchors(!showAnchors)}
        >
          <span>🌿</span>
          <span>{showAnchors ? 'Physical Anchors (open)' : 'Ground in Senses (Weather, Scent, Song)'}</span>
        </button>
      </div>

      {/* Sensory Anchor Inputs */}
      {showAnchors && setSensory && (
        <div className="sensory-anchors-box fade-in">
          <p className="sensory-hint">Sensory atmosphere at the time of this memory:</p>
          <div className="sensory-grid">
            <div className="sensory-field">
              <label>🌧️ Weather / Season</label>
              <input
                type="text"
                placeholder="e.g. Rainy monsoon evening, early snow"
                value={sensory.weather || ''}
                onChange={(e) => setSensory({ ...sensory, weather: e.target.value })}
              />
              <div className="sensory-chips">
                {['🌧️ Monsoon rain', '🌅 Golden hour sunset', '❄️ Winter morning frost', '☀️ Quiet sunny morning'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="sensory-chip-btn"
                    onClick={() => setSensory({ ...sensory, weather: chip })}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div className="sensory-field">
              <label>☕ Scent / Taste</label>
              <input
                type="text"
                placeholder="e.g. Cardamom chai, wet pine needles"
                value={sensory.scent || ''}
                onChange={(e) => setSensory({ ...sensory, scent: e.target.value })}
              />
              <div className="sensory-chips">
                {['☕ Cardamom chai', '🪵 Woodsmoke & pine', '🌸 Jasmine & sandalwood', '📖 Old books'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="sensory-chip-btn"
                    onClick={() => setSensory({ ...sensory, scent: chip })}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div className="sensory-field">
              <label>🎵 Song / Ambient Sound</label>
              <input
                type="text"
                placeholder="e.g. Radio playing old ghazals"
                value={sensory.song || ''}
                onChange={(e) => setSensory({ ...sensory, song: e.target.value })}
              />
              <div className="sensory-chips">
                {['🎵 Acoustic guitar', '📻 Late night radio', '🎹 Slow piano', '🪕 Classical sarod'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="sensory-chip-btn"
                    onClick={() => setSensory({ ...sensory, song: chip })}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
