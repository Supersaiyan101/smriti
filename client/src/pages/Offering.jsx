import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import MemoryInput from '../components/MemoryInput';
import GentleWhispers from '../components/GentleWhispers';
import './Offering.css';

/**
 * Offering — The quiet 3-step form to remember someone.
 * 1. Name & relationship
 * 2. Memories (text / voice / photo + Gentle Whispers)
 * 3. Light their flame
 */
export default function Offering() {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [textContent, setTextContent] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle prompt clicked from Gentle Whispers
  const handleSelectPrompt = (promptText) => {
    setTextContent((prev) => {
      if (!prev) return promptText;
      return `${prev}\n\n${promptText}`;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter their name.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Preparing the altar...');

    try {
      // Step 1: Create Profile
      const profileFormData = new FormData();
      profileFormData.append('name', name.trim());
      profileFormData.append('relationship', relationship.trim() || 'Loved one');
      if (photoFile) {
        profileFormData.append('photo', photoFile);
      }

      const profileRes = await fetch('/api/profiles', {
        method: 'POST',
        body: profileFormData,
      });

      const profileData = await profileRes.json();
      if (!profileData.success) {
        throw new Error(profileData.error || 'Failed to create profile');
      }

      const profileId = profileData.profile._id;

      // Step 2: Upload Memory Fragments (if provided)
      if (textContent.trim()) {
        setStatusMessage('Preserving written words...');
        await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId,
            type: 'text',
            content: textContent.trim(),
            sourceLabel: 'Written memory',
          }),
        });
      }

      if (audioBlob) {
        setStatusMessage('Gathering their spoken voice...');
        const audioFormData = new FormData();
        audioFormData.append('profileId', profileId);
        audioFormData.append('type', 'voice');
        audioFormData.append('media', audioBlob, 'voicenote.webm');
        audioFormData.append('sourceLabel', 'Spoken voice note');

        await fetch('/api/memories', {
          method: 'POST',
          body: audioFormData,
        });
      }

      setStatusMessage('Lighting their flame...');
      setTimeout(() => {
        navigate(`/remember/${profileId}`);
      }, 1200);
    } catch (err) {
      console.error('Offering submission failed:', err);
      alert('Could not save offering: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page offering-page fade-in">
      {/* Top Navigation */}
      <nav className="offering-nav">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Back to Sanctuary
        </Link>
      </nav>

      {/* Header */}
      <header className="page-header">
        <CandleFlame size="md" />
        <h1 style={{ marginTop: '1rem', fontSize: '2.2rem' }}>The Offering</h1>
        <p className="subtitle">
          Place someone into the sanctuary. Even one small memory is enough.
        </p>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="offering-form">
        {/* Step 1: Who */}
        <section className="offering-section">
          <div className="section-badge">1. Who are we remembering?</div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="offering-name">Their Name *</label>
              <input
                id="offering-name"
                type="text"
                className="form-input"
                placeholder="e.g. Maya Sharma, Alex Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="offering-rel">Who were they to you?</label>
              <input
                id="offering-rel"
                type="text"
                className="form-input"
                placeholder="e.g. My best friend, My mother, My mentor"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Step 2: Memories */}
        <section className="offering-section">
          <div className="section-badge">2. Their words, voice, or memory</div>
          <MemoryInput
            textContent={textContent}
            setTextContent={setTextContent}
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
          />
          <GentleWhispers onSelectPrompt={handleSelectPrompt} />
        </section>

        {/* Step 3: Action */}
        <section className="offering-section offering-section--submit">
          <button
            type="submit"
            className="btn btn-primary btn-light-flame"
            disabled={isSubmitting || !name.trim()}
          >
            <CandleFlame size="sm" />
            <span>{isSubmitting ? statusMessage : 'Light their flame'}</span>
          </button>
          <p className="offering-privacy-note">
            🔒 Privacy guarantee: Memories are stored securely and never shared with corporate ad networks or public models.
          </p>
        </section>
      </form>
    </div>
  );
}
