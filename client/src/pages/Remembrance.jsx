import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import VoicePlayer from '../components/VoicePlayer';
import TheVigil from '../components/TheVigil';
import WriteToThemModal from '../components/WriteToThemModal';
import AmbientSoundscape from '../components/AmbientSoundscape';
import './Remembrance.css';

/**
 * Remembrance — The sacred core experience.
 * Powered by Google Gemma & Mastra Agent Pipeline.
 * Features: Adaptive Reflection, The Vigil Mode, Letters to Them, Sensory Anchors.
 */
export default function Remembrance() {
  const { id } = useParams();

  // Profile & Memory State
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
  const [lettersToThem, setLettersToThem] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [query, setQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);

  // Depth Modals
  const [isVigilOpen, setIsVigilOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [readingLetter, setReadingLetter] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchLettersToThem();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`/api/profiles/${id}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setMemories(data.memories || []);

        if (data.memories && data.memories.length > 0) {
          triggerInitialReflection(data.profile._id);
        }
      }
    } catch (err) {
      console.warn('Could not load profile:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLettersToThem = async () => {
    try {
      const res = await fetch(`/api/letters-to-them/${id}`);
      const data = await res.json();
      if (data.success) {
        setLettersToThem(data.letters || []);
      }
    } catch (err) {
      console.warn('Could not fetch letters to them:', err.message);
    }
  };

  const triggerInitialReflection = async (profileId) => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          query: 'What words or wisdom did they leave behind?',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data);
      }
    } catch (err) {
      console.warn('Initial reflection notice:', err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSendThought = async (e) => {
    e?.preventDefault();
    if (!query.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: id,
          query: query.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse(data);
        setQuery('');
      }
    } catch (err) {
      console.error('Conversation error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page remembrance-page">
        <CandleFlame size="lg" />
        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Entering the sanctuary...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page remembrance-page">
        <h2>Sanctuary Not Found</h2>
        <Link to="/" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
          ← Return to Sanctuary
        </Link>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isSparse = memories.length <= 3;

  return (
    <div className="page remembrance-page fade-in">
      {/* Top Nav Cluster */}
      <nav className="remembrance-nav">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Sanctuary Shelf
        </Link>

        <div className="remembrance-nav-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-vigil-trigger"
            onClick={() => setIsVigilOpen(true)}
            title="Sit in silence with glowing portrait and fading embers"
          >
            <span>🕯️</span>
            <span>Sit with Them (Vigil)</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsWriteModalOpen(true)}
            title="Write an unsent letter directly to them"
          >
            <span>✉️</span>
            <span>Write to Them</span>
          </button>

          <Link to={`/letter/${profile._id}`} className="btn btn-ghost btn-sm btn-letter">
            <span>📜</span>
            <span>Keepsake Letter</span>
          </Link>

          <AmbientSoundscape />
        </div>
      </nav>

      {/* Portrait Focal Point */}
      <header className="remembrance-header">
        <div className="remembrance-hearth">
          <div className="remembrance-portrait">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} />
            ) : (
              <span className="remembrance-initials">{initials}</span>
            )}
          </div>
          <div className="remembrance-hearth__flame">
            <CandleFlame size="lg" />
          </div>
        </div>

        <h1 className="remembrance-name">{profile.name}</h1>
        <p className="remembrance-rel">{profile.relationship}</p>

        {/* Mode Indicator */}
        <div className="remembrance-mode-badge">
          {isSparse ? (
            <span>🕯️ Candlelight Reflection Mode • {memories.length} {memories.length === 1 ? 'memory' : 'memories'} preserved</span>
          ) : (
            <span>✨ Sanctuary Conversation Mode • {memories.length} memories preserved</span>
          )}
        </div>
      </header>

      {/* Main Sanctuary Altar Space */}
      <main className="remembrance-content">
        {/* Active Response from Gemma / Mastra */}
        {response && (
          <section className="remembrance-response-card fade-in-up">
            <div className="response-header">
              <span className="response-engine-tag">
                {response.engine || 'Google Gemma Sanctuary Grounding'}
              </span>
              {response.citations && response.citations.length > 0 && (
                <div className="response-citations">
                  {response.citations.map((c, idx) => (
                    <span
                      key={idx}
                      className={`citation-pill ${activeCitation === c ? 'citation-pill--active' : ''}`}
                      onClick={() => setActiveCitation(activeCitation === c ? null : c)}
                    >
                      ⚓ {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="response-body">
              {response.message.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* ElevenLabs Spoken Audio Readout */}
            <div className="response-voice-bar">
              <VoicePlayer text={response.message} />
            </div>
          </section>
        )}

        {/* Loading state for reflection */}
        {isSynthesizing && (
          <div className="remembrance-synthesizing fade-in">
            <CandleFlame size="md" />
            <p>Sitting quietly with their words...</p>
          </div>
        )}

        {/* User Thought Input Bar */}
        <form onSubmit={handleSendThought} className="remembrance-prompt-bar">
          <input
            type="text"
            className="remembrance-input"
            placeholder={
              isSparse
                ? "Ask what they would say, or reflect on a memory..."
                : "What's on your mind today?"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSynthesizing}
          />
          <button
            type="submit"
            className="btn btn-primary btn-reflect"
            disabled={isSynthesizing || !query.trim()}
          >
            Reflect
          </button>
        </form>

        {/* Preserved Memory Ember Cards with Sensory Anchors */}
        {memories.length > 0 && (
          <section className="remembrance-embers">
            <h4 className="embers-title">Preserved Fragments</h4>
            <div className="embers-grid">
              {memories.map((mem) => (
                <div
                  key={mem._id}
                  className={`ember-card ${activeCitation === mem.sourceLabel ? 'ember-card--highlight' : ''}`}
                >
                  <span className="ember-label">
                    {mem.type === 'voice' ? '🎤 ' : '📝 '}
                    {mem.sourceLabel || 'Memory'}
                  </span>
                  <p className="ember-text">"{mem.content}"</p>

                  {/* Sensory Anchors */}
                  {mem.sensory && (mem.sensory.weather || mem.sensory.scent || mem.sensory.song) && (
                    <div className="ember-sensory-tags">
                      {mem.sensory.weather && <span>🌧️ {mem.sensory.weather}</span>}
                      {mem.sensory.scent && <span>☕ {mem.sensory.scent}</span>}
                      {mem.sensory.song && <span>🎵 {mem.sensory.song}</span>}
                    </div>
                  )}

                  {mem.mediaUrl && mem.type === 'voice' && (
                    <audio controls src={mem.mediaUrl} className="ember-audio" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Letters to Them (Unsent Letters Shelf) */}
        {lettersToThem.length > 0 && (
          <section className="letters-to-them-shelf">
            <h4 className="embers-title">✉️ Letters Sealed to {profile.name}</h4>
            <div className="envelopes-grid">
              {lettersToThem.map((letter) => (
                <div
                  key={letter._id}
                  className="sealed-envelope-card"
                  onClick={() => setReadingLetter(letter)}
                  title="Click to unfold letter"
                >
                  <div className="envelope-stamp">✉️</div>
                  <h5 className="envelope-title">{letter.title}</h5>
                  <span className="envelope-date">
                    {new Date(letter.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="envelope-peek">
                    "{letter.content.slice(0, 70)}..."
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Depth Modal: Silent Vigil Mode ("Sit with Them") */}
      {isVigilOpen && (
        <TheVigil
          profile={profile}
          memories={memories}
          onClose={() => setIsVigilOpen(false)}
        />
      )}

      {/* Depth Modal: Write to Them */}
      {isWriteModalOpen && (
        <WriteToThemModal
          profileId={profile._id}
          personName={profile.name}
          onClose={() => setIsWriteModalOpen(false)}
          onLetterSaved={(newLetter) => setLettersToThem([newLetter, ...lettersToThem])}
        />
      )}

      {/* Depth Modal: Read Unfolded Letter */}
      {readingLetter && (
        <div className="write-letter-overlay fade-in" onClick={() => setReadingLetter(null)}>
          <div className="write-letter-card fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="write-letter-header">
              <div className="write-letter-title-row">
                <CandleFlame size="sm" />
                <h3>{readingLetter.title}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setReadingLetter(null)}>
                ✕
              </button>
            </div>
            <p className="envelope-date" style={{ marginBottom: '1.5rem' }}>
              Written to {profile.name} • {new Date(readingLetter.createdAt).toLocaleDateString()}
            </p>
            <div className="letter-unfolded-body">
              {readingLetter.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '1rem', fontStyle: 'italic', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', lineHeight: '1.8' }}>
                  {para}
                </p>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReadingLetter(null)}>
                Fold & Return to Altar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
