import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import MemoryInput from '../components/MemoryInput';
import GentleWhispers from '../components/GentleWhispers';
import HoldToLightFlame from '../components/HoldToLightFlame';
import AmbientSoundscape from '../components/AmbientSoundscape';
import './Offering.css';

/**
 * Offering — The quiet 3-step form to remember someone.
 * 1. Name & relationship
 * 2. Memories (text / voice / photo + sensory anchors + Gentle Whispers)
 * 3. Hold-to-light ceremony
 */
export default function Offering() {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [textContent, setTextContent] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [sensory, setSensory] = useState({ weather: '', scent: '', song: '' });
  const [timePlace, setTimePlace] = useState({ when: '', where: '' });
  const [restoredDraftNotice, setRestoredDraftNotice] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smriti_offering_draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name || data.textContent) {
          setName(data.name || '');
          setRelationship(data.relationship || '');
          setTextContent(data.textContent || '');
          if (data.sensory) setSensory(data.sensory);
          if (data.timePlace) setTimePlace(data.timePlace);
          setRestoredDraftNotice(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }, []);

  // Quiet auto-save draft
  useEffect(() => {
    if (name || relationship || textContent || sensory.weather || sensory.scent || sensory.song || timePlace.when || timePlace.where) {
      localStorage.setItem('smriti_offering_draft', JSON.stringify({
        name, relationship, textContent, sensory, timePlace
      }));
    }
  }, [name, relationship, textContent, sensory, timePlace]);

  // Handle prompt clicked from Gentle Whispers
  const handleSelectPrompt = (promptText) => {
    setTextContent((prev) => {
      if (!prev) return promptText;
      return `${prev}\n\n${promptText}`;
    });
  };

  const handleIgnited = async () => {
    if (!name.trim()) {
      alert('Please enter their name before lighting the flame.');
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

      // Clean sensory & spacetime pinning objects
      const hasSensory = sensory.weather || sensory.scent || sensory.song;
      const sensoryPayload = hasSensory ? sensory : null;

      const hasTimePlace = timePlace.when || timePlace.where;
      const timePlacePayload = hasTimePlace ? timePlace : null;

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
            sensory: sensoryPayload,
            timePlace: timePlacePayload,
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
        if (sensoryPayload) {
          audioFormData.append('sensory', JSON.stringify(sensoryPayload));
        }
        if (timePlacePayload) {
          audioFormData.append('timePlace', JSON.stringify(timePlacePayload));
        }

        await fetch('/api/memories', {
          method: 'POST',
          body: audioFormData,
        });
      }

      setStatusMessage('The flame is burning...');
      try {
        localStorage.removeItem('smriti_offering_draft');
      } catch {}
      setTimeout(() => {
        navigate(`/remember/${profileId}`);
      }, 1000);
    } catch (err) {
      console.error('Offering submission failed:', err);
      alert('Could not save offering: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page offering-page fade-in">
      {/* Top Navigation with Ambient Audio */}
      <nav className="offering-nav">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Back to Sanctuary
        </Link>
        <AmbientSoundscape />
      </nav>

      {/* Header */}
      <header className="page-header">
        <CandleFlame size="md" />
        <h1 style={{ marginTop: '1rem', fontSize: '2.2rem' }}>The Offering</h1>
        <p className="subtitle">
          Place someone into the sanctuary. Even one small memory is enough.
        </p>

        {/* Restored Draft Banner */}
        {restoredDraftNotice && (
          <div className="offering-draft-banner fade-in">
            <span>✍️ Restored your previous memory draft</span>
            <button
              type="button"
              className="btn-clear-draft"
              onClick={() => {
                try {
                  localStorage.removeItem('smriti_offering_draft');
                } catch {}
                setName('');
                setRelationship('');
                setTextContent('');
                setSensory({ weather: '', scent: '', song: '' });
                setTimePlace({ when: '', where: '' });
                setRestoredDraftNotice(false);
              }}
            >
              Start Fresh
            </button>
          </div>
        )}
      </header>

      {/* Main Form */}
      <form onSubmit={(e) => e.preventDefault()} className="offering-form">
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

        {/* Step 2: Memories & Sensory Anchors */}
        <section className="offering-section">
          <div className="section-badge">2. Their words, voice, or memory</div>
          <MemoryInput
            textContent={textContent}
            setTextContent={setTextContent}
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
            photoFile={photoFile}
            setPhotoFile={setPhotoFile}
            sensory={sensory}
            setSensory={setSensory}
            timePlace={timePlace}
            setTimePlace={setTimePlace}
          />
          <GentleWhispers onSelectPrompt={handleSelectPrompt} />
        </section>

        {/* Step 3: Sacred Hold-to-Light Ceremony */}
        <section className="offering-section offering-section--submit">
          <HoldToLightFlame
            onIgnited={handleIgnited}
            disabled={isSubmitting || !name.trim()}
            label="Hold to light their flame"
          />
          {statusMessage && (
            <p className="offering-status-msg fade-in">{statusMessage}</p>
          )}
          <p className="offering-privacy-note">
            🔒 Privacy guarantee: Memories are stored securely and never shared with corporate ad networks or public models.
          </p>
        </section>
      </form>
    </div>
  );
}
