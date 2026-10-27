import { useState } from 'react';
import CandleFlame from './CandleFlame';
import './WriteToThemModal.css';

/**
 * WriteToThemModal — Compose an unsent letter to the departed.
 * Sealed into a digital envelope and preserved beside their hearth.
 * 
 * @param {Object} props
 * @param {string} props.profileId - Profile ID
 * @param {string} props.personName - Name of the person
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onLetterSaved - Callback when letter is preserved
 */
export default function WriteToThemModal({ profileId, personName, onClose, onLetterSaved }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSealing, setIsSealing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSealing(true);

    try {
      const res = await fetch('/api/letters-to-them', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          title: title.trim() || `Letter to ${personName}`,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onLetterSaved) onLetterSaved(data.letter);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Error saving letter:', err);
      setIsSealing(false);
    }
  };

  return (
    <div className="write-letter-overlay fade-in">
      <div className="write-letter-card fade-in-up">
        {/* Header */}
        <div className="write-letter-header">
          <div className="write-letter-title-row">
            <CandleFlame size="sm" />
            <h3>A Letter to {personName}</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="write-letter-subtitle">
          Say what was left unsaid, or share how your days are unfolding.
          These words remain sealed quietly beside their flame.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="write-letter-form">
          <input
            type="text"
            className="letter-input-title"
            placeholder="Title (e.g. 'Thinking of you today', 'I got the job')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="letter-input-body"
            rows={7}
            placeholder={`Dear ${personName},\n\nWrite whatever is on your heart...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            autoFocus
          />

          <div className="write-letter-footer">
            <span className="privacy-whisper">
              🔒 Private & sealed. Never used for public feeds.
            </span>
            <button
              type="submit"
              className="btn btn-primary btn-seal"
              disabled={isSealing || !content.trim()}
            >
              <span>{isSealing ? 'Sealing into envelope...' : '✉️ Seal Letter & Place at Altar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
