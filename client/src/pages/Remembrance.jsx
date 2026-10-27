import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import VoicePlayer from '../components/VoicePlayer';
import TheVigil from '../components/TheVigil';
import WriteToThemModal from '../components/WriteToThemModal';
import AmbientSoundscape from '../components/AmbientSoundscape';
import MemoryReel from '../components/MemoryReel';
import MemoryReelEditor from '../components/MemoryReelEditor';
import './Remembrance.css';

/**
 * Remembrance — The sacred core experience.
 * Powered by Google Gemma & Mastra Agent Pipeline.
 * Features:
 *  - The Memory Reel (flagship photo story slideshow + music)
 *  - Slow Ink Emergence (calm gradual writing reveal)
 *  - Citation Artifact Unfolding (inspecting original memory anchors)
 *  - The Vigil Mode (silent contemplation)
 *  - Letters to Them (unsent sealed letters shelf)
 *  - Sensory Anchors (weather, scent, song)
 */
export default function Remembrance() {
  const { id } = useParams();

  // Profile & Memory State
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
  const [lettersToThem, setLettersToThem] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flagship Feature: The Memory Reel State
  const [reelData, setReelData] = useState({ slides: [], soundtrack: null });
  const [isReelOpen, setIsReelOpen] = useState(false);
  const [isReelEditorOpen, setIsReelEditorOpen] = useState(false);

  // Interaction State
  const [query, setQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);

  // Slow Ink Emergence State
  const [revealedLength, setRevealedLength] = useState(0);
  const [isWriting, setIsWriting] = useState(false);

  // Depth Modals
  const [isVigilOpen, setIsVigilOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [readingLetter, setReadingLetter] = useState(null);
  const [inspectedArtifact, setInspectedArtifact] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchLettersToThem();
    fetchReelData();
  }, [id]);

  const fetchReelData = async () => {
    try {
      const res = await fetch(`/api/memories/reel/${id}`);
      const data = await res.json();
      if (data.success) {
        setReelData({
          slides: data.slides || [],
          soundtrack: data.soundtrack || null,
        });
      }
    } catch (err) {
      console.warn('Could not fetch memory reel:', err.message);
    }
  };

  // Slow ink emergence effect when a response arrives
  useEffect(() => {
    if (!response?.message) return;

    const fullText = response.message;
    setIsWriting(true);
    setRevealedLength(0);

    let currentIdx = 0;
    const timer = setInterval(() => {
      // Find next word boundary
      const nextSpace = fullText.indexOf(' ', currentIdx + 3);
      if (nextSpace === -1 || nextSpace >= fullText.length - 1) {
        setRevealedLength(fullText.length);
        setIsWriting(false);
        clearInterval(timer);
      } else {
        currentIdx = nextSpace + 1;
        setRevealedLength(currentIdx);
      }
    }, 28);

    return () => clearInterval(timer);
  }, [response?.message]);

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

  // Open the unfolded artifact inspection drawer
  const handleOpenArtifact = (citationLabel) => {
    const clean = citationLabel.replace(/^[⚓\s\[]+|[\]\s]+$/g, '').trim();
    setActiveCitation(clean);

    const found = memories.find(
      (m) =>
        (m.sourceLabel && m.sourceLabel.toLowerCase() === clean.toLowerCase()) ||
        (m.content && m.content.toLowerCase().includes(clean.toLowerCase()))
    );

    if (found) {
      setInspectedArtifact(found);
    } else {
      setInspectedArtifact({
        sourceLabel: clean,
        content: `Direct remembrance fragment preserved in honor of ${profile.name}.`,
        type: 'note',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleSkipInk = () => {
    if (response?.message) {
      setRevealedLength(response.message.length);
      setIsWriting(false);
    }
  };

  // Formats text so any bracketed citation e.g. [Sunday kitchen, 2015] is an interactive link
  const renderFormattedParagraph = (paragraphText, pIndex) => {
    const parts = paragraphText.split(/(\[[^\]]+\])/g);
    return (
      <p key={pIndex} className="response-paragraph">
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const rawLabel = part.slice(1, -1);
            return (
              <button
                key={i}
                type="button"
                className="citation-inline-anchor"
                onClick={() => handleOpenArtifact(rawLabel)}
                title={`Inspect original artifact: ${rawLabel}`}
              >
                ⚓ [{rawLabel}]
              </button>
            );
          }
          return part;
        })}
      </p>
    );
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
  const currentDisplayedText = response?.message ? response.message.slice(0, revealedLength) : '';

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

          <button
            type="button"
            className="btn btn-primary btn-sm btn-reel-trigger"
            onClick={() => {
              if (reelData.slides && reelData.slides.length > 0) {
                setIsReelOpen(true);
              } else {
                setIsReelEditorOpen(true);
              }
            }}
            title="Watch or curate their living Memory Reel"
          >
            <span>🎞️</span>
            <span>Memory Reel {reelData.slides && reelData.slides.length > 0 ? `(${reelData.slides.length})` : '+'}</span>
          </button>

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
            <div className="remembrance-portrait__reflection" aria-hidden="true" />
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
        {/* Flagship Centerpiece: The Memory Reel Showcase Card */}
        <section className="altar-reel-card fade-in-up">
          <div className="altar-reel-left">
            <div className="altar-reel-badge-group">
              <span className="altar-reel-flagship-badge">🎞️ THE MEMORY REEL • स्मृति कथा</span>
              {reelData.soundtrack && (
                <span className="altar-reel-track-badge">
                  🎵 {reelData.soundtrack.title || 'Soundtrack Paired'}
                </span>
              )}
            </div>
            <h3 className="altar-reel-title">
              {reelData.slides && reelData.slides.length > 0
                ? `${profile.name}’s Living Memory Reel`
                : `Create ${profile.name}’s Memory Reel`}
            </h3>
            <p className="altar-reel-desc">
              {reelData.slides && reelData.slides.length > 0
                ? `${reelData.slides.length} cherished ${reelData.slides.length === 1 ? 'moment' : 'moments'} woven into a cinematic Spotify Wrapped-style slideshow with music and quiet stories.`
                : `Weave their photos and heartfelt stories into a cinematic slideshow set to their favorite melody. Kept forever on their altar.`}
            </p>
          </div>

          <div className="altar-reel-actions">
            {reelData.slides && reelData.slides.length > 0 ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-reel-watch"
                  onClick={() => setIsReelOpen(true)}
                  title="Watch the cinematic slideshow"
                >
                  <span className="play-triangle">▶</span>
                  <span>Watch Reel</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-reel-config"
                  onClick={() => setIsReelEditorOpen(true)}
                  title="Add photos, edit stories, or change soundtrack"
                >
                  <span>⚙️ Curate</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-reel-watch"
                onClick={() => setIsReelEditorOpen(true)}
                title="Create the first moment in their reel"
              >
                <span>✨ Begin Their Reel</span>
              </button>
            )}
          </div>
        </section>

        {/* Active Response from Gemma / Mastra */}
        {response && (
          <section className="remembrance-response-card fade-in-up">
            <div className="response-header">
              <span className="response-engine-tag">
                {response.engine || 'Google Gemma Sanctuary Grounding'}
              </span>

              <div className="response-header-right">
                {response.citations && response.citations.length > 0 && (
                  <div className="response-citations">
                    {response.citations.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`citation-pill ${activeCitation === c ? 'citation-pill--active' : ''}`}
                        onClick={() => handleOpenArtifact(c)}
                        title={`Click to unfold preserved artifact: ${c}`}
                      >
                        ⚓ {c}
                      </button>
                    ))}
                  </div>
                )}

                {isWriting && (
                  <button
                    type="button"
                    className="btn-ink-skip"
                    onClick={handleSkipInk}
                    title="Reveal reflection in full"
                  >
                    Reveal in full
                  </button>
                )}
              </div>
            </div>

            <div className="response-body">
              {currentDisplayedText.split('\n\n').map((paragraph, i) =>
                renderFormattedParagraph(paragraph, i)
              )}

              {/* Glowing ink tip while writing */}
              {isWriting && (
                <span className="ink-quill-cursor" title="Words emerging..." />
              )}
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
                  onClick={() => handleOpenArtifact(mem.sourceLabel || mem.content)}
                  title="Click to unfold full archival artifact"
                  style={{ cursor: 'pointer' }}
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

                  {/* Spacetime Pinning */}
                  {mem.timePlace && (mem.timePlace.when || mem.timePlace.where) && (
                    <div className="ember-timeplace-tags">
                      {mem.timePlace.when && <span>🗓️ {mem.timePlace.when}</span>}
                      {mem.timePlace.where && <span>📍 {mem.timePlace.where}</span>}
                    </div>
                  )}

                  {mem.mediaUrl && mem.type === 'voice' && (
                    <audio controls src={mem.mediaUrl} className="ember-audio" onClick={(e) => e.stopPropagation()} />
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

      {/* Depth Modal: Archival Citation Artifact Unfolding */}
      {inspectedArtifact && (
        <div className="artifact-inspector-overlay fade-in" onClick={() => setInspectedArtifact(null)}>
          <div className="artifact-inspector-card fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="artifact-inspector-header">
              <div className="artifact-header-title">
                <CandleFlame size="sm" />
                <h3>Archival Memory Artifact</h3>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={() => setInspectedArtifact(null)}
                aria-label="Close artifact inspection"
              >
                ✕
              </button>
            </div>

            <div className="artifact-inspector-body">
              <div className="artifact-meta-bar">
                <span className="artifact-type-badge">
                  {inspectedArtifact.type === 'voice' ? '🎤 Spoken Audio Fragment' : '📜 Written Recollection'}
                </span>
                <span className="artifact-anchor-badge">
                  ⚓ {inspectedArtifact.sourceLabel || 'Original Source'}
                </span>
                {inspectedArtifact.timePlace && (inspectedArtifact.timePlace.when || inspectedArtifact.timePlace.where) && (
                  <span className="artifact-timeplace-pill">
                    {inspectedArtifact.timePlace.when && `🗓️ ${inspectedArtifact.timePlace.when}`}
                    {inspectedArtifact.timePlace.when && inspectedArtifact.timePlace.where && ' • '}
                    {inspectedArtifact.timePlace.where && `📍 ${inspectedArtifact.timePlace.where}`}
                  </span>
                )}
                {inspectedArtifact.createdAt && (
                  <span className="artifact-date">
                    Preserved {new Date(inspectedArtifact.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <blockquote className="artifact-quote">
                "{inspectedArtifact.content}"
              </blockquote>

              {/* Sensory Anchors Panel */}
              {inspectedArtifact.sensory &&
                (inspectedArtifact.sensory.weather ||
                  inspectedArtifact.sensory.scent ||
                  inspectedArtifact.sensory.song) && (
                  <div className="artifact-sensory-panel">
                    <h5 className="artifact-sensory-title">Sensory Atmosphere at Time of Memory</h5>
                    <div className="artifact-sensory-items">
                      {inspectedArtifact.sensory.weather && (
                        <div className="artifact-sensory-item">
                          <span className="sensory-icon">🌧️</span>
                          <div>
                            <span className="sensory-label">Weather</span>
                            <span className="sensory-val">{inspectedArtifact.sensory.weather}</span>
                          </div>
                        </div>
                      )}
                      {inspectedArtifact.sensory.scent && (
                        <div className="artifact-sensory-item">
                          <span className="sensory-icon">☕</span>
                          <div>
                            <span className="sensory-label">Scent</span>
                            <span className="sensory-val">{inspectedArtifact.sensory.scent}</span>
                          </div>
                        </div>
                      )}
                      {inspectedArtifact.sensory.song && (
                        <div className="artifact-sensory-item">
                          <span className="sensory-icon">🎵</span>
                          <div>
                            <span className="sensory-label">Song / Sound</span>
                            <span className="sensory-val">{inspectedArtifact.sensory.song}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Media or Voice player if present */}
              {inspectedArtifact.mediaUrl && (
                <div className="artifact-media-container">
                  {inspectedArtifact.type === 'voice' ? (
                    <audio controls src={inspectedArtifact.mediaUrl} className="artifact-audio-player" />
                  ) : (
                    <img src={inspectedArtifact.mediaUrl} alt="Memory artifact" className="artifact-img-preview" />
                  )}
                </div>
              )}

              <div className="artifact-footer-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setInspectedArtifact(null)}
                >
                  ← Return to Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Flagship Modal: Cinematic Memory Reel Viewer (Layout A Split + Spotify Wrapped Soundtrack) */}
      {isReelOpen && (
        <MemoryReel
          profile={profile}
          slides={reelData.slides}
          soundtrack={reelData.soundtrack}
          onClose={() => setIsReelOpen(false)}
          onOpenEditor={() => {
            setIsReelOpen(false);
            setIsReelEditorOpen(true);
          }}
        />
      )}

      {/* Flagship Modal: Memory Reel Editor / Curator */}
      {isReelEditorOpen && (
        <MemoryReelEditor
          profileId={profile._id}
          personName={profile.name}
          initialSoundtrack={reelData.soundtrack}
          onClose={() => setIsReelEditorOpen(false)}
          onSlideSaved={() => {
            fetchReelData();
            fetchProfileData();
          }}
          onSoundtrackUpdated={() => {
            fetchReelData();
          }}
        />
      )}
    </div>
  );
}
