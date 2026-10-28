import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import HoldToLightFlame from '../components/HoldToLightFlame';
import AmbientSoundscape from '../components/AmbientSoundscape';
import './Offering.css';

/**
 * Offering — The Living Memory Reel Creator & Ceremony.
 * 1. Who are we honoring? (Name, relationship, altar portrait)
 * 2. The Moments (Photos, videos, heartfelt stories, spacetime coordinates)
 * 3. The Soundtrack (Offline MP3 upload, Spotify link, or curated presets)
 * 4. Hold-to-light ceremony that transitions into their Altar and launches the Reel!
 */
export default function Offering() {
  const navigate = useNavigate();

  // Step 1: Who
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [portraitFile, setPortraitFile] = useState(null);
  const [portraitPreview, setPortraitPreview] = useState(null);

  // Step 2: Moments (Reel Slides)
  const [moments, setMoments] = useState([
    {
      id: 'm_init_1',
      mediaFile: null,
      mediaPreview: null,
      isVideo: false,
      title: '',
      story: '',
      when: '',
      where: '',
    },
  ]);

  // Step 3: Slideshow Soundtrack
  const [soundtrackMode, setSoundtrackMode] = useState('preset'); // 'upload' | 'preset' | 'spotify'
  const [soundtrackTitle, setSoundtrackTitle] = useState('Peaceful Piano Dusk');
  const [selectedPreset, setSelectedPreset] = useState('piano_dusk');
  const [songFile, setSongFile] = useState(null);
  const [songFileName, setSongFileName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');

  // Draft & Submission State
  const [restoredDraftNotice, setRestoredDraftNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const portraitInputRef = useRef(null);
  const songInputRef = useRef(null);

  // Restore Draft on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smriti_reel_offering_draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.name || (data.moments && data.moments.length > 0 && data.moments[0].story)) {
          setName(data.name || '');
          setRelationship(data.relationship || '');
          if (data.moments && data.moments.length > 0) {
            setMoments(
              data.moments.map((m, idx) => ({
                id: `m_restored_${idx}`,
                mediaFile: null,
                mediaPreview: null,
                isVideo: false,
                title: m.title || '',
                story: m.story || '',
                when: m.when || '',
                where: m.where || '',
              }))
            );
          }
          if (data.soundtrack) {
            setSoundtrackMode(data.soundtrack.mode || 'preset');
            setSoundtrackTitle(data.soundtrack.title || 'Peaceful Piano Dusk');
            setSelectedPreset(data.soundtrack.presetType || 'piano_dusk');
            setSpotifyUrl(data.soundtrack.spotifyUrl || '');
          }
          setRestoredDraftNotice(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }, []);

  // Auto-Save Draft
  useEffect(() => {
    const hasContent =
      name ||
      relationship ||
      moments.some((m) => m.title || m.story || m.when || m.where) ||
      spotifyUrl;

    if (hasContent) {
      try {
        localStorage.setItem(
          'smriti_reel_offering_draft',
          JSON.stringify({
            name,
            relationship,
            moments: moments.map((m) => ({
              title: m.title,
              story: m.story,
              when: m.when,
              where: m.where,
            })),
            soundtrack: {
              mode: soundtrackMode,
              title: soundtrackTitle,
              presetType: selectedPreset,
              spotifyUrl,
            },
          })
        );
      } catch (e) {}
    }
  }, [name, relationship, moments, soundtrackMode, soundtrackTitle, selectedPreset, spotifyUrl]);

  // Handle Altar Portrait Selection
  const handlePortraitSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortraitFile(file);
      setPortraitPreview(URL.createObjectURL(file));
    }
  };

  // Add Another Moment to Reel
  const handleAddMoment = () => {
    setMoments((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        mediaFile: null,
        mediaPreview: null,
        isVideo: false,
        title: '',
        story: '',
        when: '',
        where: '',
      },
    ]);
  };

  // Remove a Moment
  const handleRemoveMoment = (indexToRemove) => {
    if (moments.length <= 1) return;
    setMoments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Update a Specific Moment Field
  const handleUpdateMoment = (index, field, value) => {
    setMoments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle Media (Photo/Video) for a Moment
  const handleMomentMedia = (index, file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video');
    const previewUrl = URL.createObjectURL(file);

    setMoments((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        mediaFile: file,
        mediaPreview: previewUrl,
        isVideo,
      };
      return updated;
    });
  };

  // Handle Song Audio File Selection
  const handleSongSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSongFile(file);
      setSongFileName(file.name);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setSoundtrackTitle(cleanName);
    }
  };

  // Sacred Hold-to-Light Ceremony & Finale Submission
  const handleIgnited = async () => {
    if (!name.trim()) {
      alert('Please enter their name before lighting the flame.');
      return;
    }

    // Check if at least one moment has media
    const validMoments = moments.filter((m) => m.mediaFile || m.story.trim());
    if (validMoments.length === 0) {
      alert('Please add at least one photograph or story to their Memory Reel.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Preparing their sacred altar...');

    try {
      // 1. Create Memorial Profile
      const profileFormData = new FormData();
      profileFormData.append('name', name.trim());
      profileFormData.append('relationship', relationship.trim() || 'Loved one');
      if (portraitFile) {
        profileFormData.append('photo', portraitFile);
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

      // 2. Upload Each Memory Reel Moment Slide
      for (let i = 0; i < validMoments.length; i++) {
        const m = validMoments[i];
        setStatusMessage(`Weaving Moment ${i + 1} of ${validMoments.length}...`);

        const reelFormData = new FormData();
        reelFormData.append('profileId', profileId);
        reelFormData.append('title', m.title.trim() || `Moment ${i + 1}`);
        reelFormData.append('story', m.story.trim() || 'A quiet memory held forever in love.');
        reelFormData.append('order', i);
        reelFormData.append('type', m.isVideo ? 'video' : 'photo');

        if (m.mediaFile) {
          reelFormData.append('media', m.mediaFile);
        } else {
          // If text-only moment was written without photo, attach default peaceful sanctuary texture
          reelFormData.append(
            'mediaUrl',
            'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80'
          );
        }

        const timePlace = {
          when: m.when.trim() || undefined,
          where: m.where.trim() || undefined,
        };
        if (timePlace.when || timePlace.where) {
          reelFormData.append('timePlace', JSON.stringify(timePlace));
        }

        await fetch('/api/memories/reel', {
          method: 'POST',
          body: reelFormData,
        });
      }

      // 3. Configure Slideshow Soundtrack
      setStatusMessage('Setting their Memory Reel melody...');
      const soundtrackFormData = new FormData();
      soundtrackFormData.append('profileId', profileId);
      soundtrackFormData.append('title', soundtrackTitle.trim() || 'Peaceful Sanctuary Melody');

      if (soundtrackMode === 'upload' && songFile) {
        soundtrackFormData.append('soundtrack', songFile);
        soundtrackFormData.append('presetType', 'upload');
      } else if (soundtrackMode === 'spotify' && spotifyUrl.trim()) {
        soundtrackFormData.append('spotifyUrl', spotifyUrl.trim());
        soundtrackFormData.append('presetType', 'spotify');
      } else {
        soundtrackFormData.append('presetType', selectedPreset);
      }

      await fetch('/api/memories/reel/soundtrack', {
        method: 'POST',
        body: soundtrackFormData,
      });

      // Clear draft
      try {
        localStorage.removeItem('smriti_reel_offering_draft');
      } catch (e) {}

      setStatusMessage('The flame is lit. Launching their living Memory Reel...');
      setTimeout(() => {
        // Navigate straight to their altar and launch the Memory Reel automatically!
        navigate(`/remember/${profileId}?autoplayReel=true`);
      }, 1000);
    } catch (err) {
      console.error('Offering submission failed:', err);
      alert('Could not save offering: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page offering-page fade-in">
      {/* Top Nav with Clean Sanctuary Ambience */}
      <nav className="offering-nav">
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Back to Sanctuary
        </Link>
        <AmbientSoundscape />
      </nav>

      {/* Header */}
      <header className="page-header">
        <CandleFlame size="md" />
        <h1 style={{ marginTop: '1rem', fontSize: '2.4rem' }}>The Offering</h1>
        <p className="subtitle">
          Place someone into the sanctuary. Weave their photos, videos, and quiet stories into a living Memory Reel.
        </p>

        {/* Restored Draft Notice */}
        {restoredDraftNotice && (
          <div className="offering-draft-banner fade-in">
            <span>✍️ Restored your previous Memory Reel draft</span>
            <button
              type="button"
              className="btn-clear-draft"
              onClick={() => {
                try {
                  localStorage.removeItem('smriti_reel_offering_draft');
                } catch (e) {}
                setName('');
                setRelationship('');
                setPortraitFile(null);
                setPortraitPreview(null);
                setMoments([
                  {
                    id: 'm1',
                    mediaFile: null,
                    mediaPreview: null,
                    isVideo: false,
                    title: '',
                    story: '',
                    when: '',
                    where: '',
                  },
                ]);
                setSoundtrackTitle('Peaceful Piano Dusk');
                setSelectedPreset('piano_dusk');
                setSpotifyUrl('');
                setRestoredDraftNotice(false);
              }}
            >
              Start Fresh
            </button>
          </div>
        )}
      </header>

      {/* Main Reel Creation Form */}
      <form onSubmit={(e) => e.preventDefault()} className="offering-form">
        {/* ============================================================
            STEP 1: WHO ARE WE HONORING?
            ============================================================ */}
        <section className="offering-section">
          <div className="section-badge">1. Who are we remembering?</div>

          <div className="offering-who-layout">
            {/* Altar Portrait Upload */}
            <div className="offering-portrait-col">
              <input
                ref={portraitInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePortraitSelect}
              />
              <div
                className="offering-portrait-bezel"
                onClick={() => portraitInputRef.current?.click()}
                title="Click to choose a portrait for their altar"
              >
                {portraitPreview ? (
                  <img src={portraitPreview} alt="Altar portrait" className="portrait-img-preview" />
                ) : (
                  <div className="portrait-empty-slot">
                    <span className="portrait-empty-icon">📷</span>
                    <span className="portrait-empty-text">Altar Portrait</span>
                  </div>
                )}
                <div className="portrait-hover-hint">Change</div>
              </div>
            </div>

            {/* Name & Relationship Fields */}
            <div className="offering-fields-col">
              <div className="form-group">
                <label htmlFor="offering-name">Their Name *</label>
                <input
                  id="offering-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Arjun Mehta, Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="offering-rel">Who were they to you?</label>
                <input
                  id="offering-rel"
                  type="text"
                  className="form-input"
                  placeholder="e.g. My best friend from college, My grandmother, My mentor"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            STEP 2: THE MOMENTS (PHOTOS, VIDEOS & QUIET STORIES)
            ============================================================ */}
        <section className="offering-section">
          <div className="section-header-row">
            <div>
              <div className="section-badge">2. The Moments (The Memory Reel)</div>
              <p className="section-subtext">
                Add the photographs and video clips that capture who they were. Write the quiet story behind each frame. Add as many as you wish.
              </p>
            </div>
            <span className="moments-counter-pill">
              🎞️ {moments.length} {moments.length === 1 ? 'Moment' : 'Moments'}
            </span>
          </div>

          <div className="reel-moments-builder">
            {moments.map((moment, idx) => (
              <div key={moment.id} className="builder-moment-card fade-in">
                {/* Moment Card Header */}
                <div className="builder-moment-header">
                  <div className="moment-index-pill">
                    <span className="moment-num">Moment {idx + 1}</span>
                    {moment.title && <span className="moment-preview-title">• {moment.title}</span>}
                  </div>
                  {moments.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-moment"
                      onClick={() => handleRemoveMoment(idx)}
                      title="Remove this moment from the reel"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div className="builder-moment-body">
                  {/* Media Dropzone (Photo or Video) */}
                  <div className="moment-media-zone">
                    <input
                      id={`media-input-${moment.id}`}
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleMomentMedia(idx, e.target.files[0])}
                    />

                    {moment.mediaPreview ? (
                      <div
                        className="moment-media-preview-container"
                        onClick={() => document.getElementById(`media-input-${moment.id}`)?.click()}
                      >
                        {/* Ambient aura so tall or wide photos never look awkwardly cropped */}
                        <div
                          className="moment-preview-backdrop"
                          style={{ backgroundImage: `url(${moment.mediaPreview})` }}
                          aria-hidden="true"
                        />
                        {moment.isVideo ? (
                          <video
                            src={moment.mediaPreview}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="moment-preview-media"
                          />
                        ) : (
                          <img
                            src={moment.mediaPreview}
                            alt="Moment preview"
                            className="moment-preview-media"
                          />
                        )}
                        <span className="media-change-overlay">Change Photo/Video</span>
                      </div>
                    ) : (
                      <div
                        className="moment-media-dropzone"
                        onClick={() => document.getElementById(`media-input-${moment.id}`)?.click()}
                      >
                        <span className="dropzone-icon">📷 🎬</span>
                        <span className="dropzone-label">Add Photograph or Video</span>
                        <span className="dropzone-hint">Click to choose image or short video clip</span>
                      </div>
                    )}
                  </div>

                  {/* Story & Metadata Inputs */}
                  <div className="moment-text-zone">
                    <div className="form-group">
                      <label htmlFor={`moment-title-${moment.id}`}>Moment Title</label>
                      <input
                        id={`moment-title-${moment.id}`}
                        type="text"
                        className="form-input"
                        placeholder="e.g. The Midnight Chai at Old Delhi Station"
                        value={moment.title}
                        onChange={(e) => handleUpdateMoment(idx, 'title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`moment-story-${moment.id}`}>The Story Behind This Moment</label>
                      <textarea
                        id={`moment-story-${moment.id}`}
                        rows={4}
                        className="form-input moment-story-textarea"
                        placeholder="What happened in this photograph? What did they say, what made everyone laugh, or what small habit of theirs is captured here?..."
                        value={moment.story}
                        onChange={(e) => handleUpdateMoment(idx, 'story', e.target.value)}
                      />
                    </div>

                    {/* Spacetime Pinning */}
                    <div className="moment-spacetime-grid">
                      <div className="spacetime-input-group">
                        <span className="spacetime-prefix">🗓️</span>
                        <input
                          type="text"
                          placeholder="When? e.g. November 2018"
                          value={moment.when}
                          onChange={(e) => handleUpdateMoment(idx, 'when', e.target.value)}
                          className="spacetime-sub-input"
                        />
                      </div>

                      <div className="spacetime-input-group">
                        <span className="spacetime-prefix">📍</span>
                        <input
                          type="text"
                          placeholder="Where? e.g. Old Delhi Railway Station"
                          value={moment.where}
                          onChange={(e) => handleUpdateMoment(idx, 'where', e.target.value)}
                          className="spacetime-sub-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Another Moment Button */}
            <button
              type="button"
              className="btn-add-another-moment"
              onClick={handleAddMoment}
            >
              <span className="add-moment-icon">+</span>
              <span>Add Another Moment to Memory Reel</span>
            </button>
          </div>
        </section>

        {/* ============================================================
            STEP 3: CHOOSE THE SLIDESHOW SOUNDTRACK
            ============================================================ */}
        <section className="offering-section">
          <div className="section-badge">3. The Slideshow Soundtrack</div>
          <p className="section-subtext">
            Choose the melody that will play gently in the background while watching their Memory Reel slideshow.
          </p>

          <div className="soundtrack-dock">
            {/* Mode Selector Tabs */}
            <div className="soundtrack-tab-nav">
              <button
                type="button"
                className={`soundtrack-tab-btn ${soundtrackMode === 'preset' ? 'soundtrack-tab-btn--active' : ''}`}
                onClick={() => setSoundtrackMode('preset')}
              >
                <span>🕯️ Sanctuary Melodies</span>
              </button>
              <button
                type="button"
                className={`soundtrack-tab-btn ${soundtrackMode === 'upload' ? 'soundtrack-tab-btn--active' : ''}`}
                onClick={() => setSoundtrackMode('upload')}
              >
                <span>📁 Upload "Their Song" (Offline MP3)</span>
              </button>
              <button
                type="button"
                className={`soundtrack-tab-btn ${soundtrackMode === 'spotify' ? 'soundtrack-tab-btn--active' : ''}`}
                onClick={() => setSoundtrackMode('spotify')}
              >
                <span>🎧 Spotify Track</span>
              </button>
            </div>

            {/* Tab 1: Sanctuary Presets */}
            {soundtrackMode === 'preset' && (
              <div className="soundtrack-tab-content fade-in">
                <p className="soundtrack-help">
                  Pure, soothing acoustic melodies synthesized in real time with zero downloads or static.
                </p>
                <div className="soundtrack-presets-grid">
                  {[
                    { key: 'piano_dusk', title: 'Peaceful Piano Dusk', icon: '🎹' },
                    { key: 'classical_sarod', title: 'Twilight Sarod & Sitar', icon: '🌙' },
                    { key: 'acoustic_strings', title: 'Warm Acoustic Strings', icon: '🎸' },
                    { key: 'rain_chimes', title: 'Rain & Wind Chimes', icon: '🌧️' },
                    { key: 'none', title: 'Silent Contemplation', icon: '🔇' },
                  ].map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      className={`preset-pill ${selectedPreset === preset.key ? 'preset-pill--active' : ''}`}
                      onClick={() => {
                        setSelectedPreset(preset.key);
                        setSoundtrackTitle(preset.title);
                      }}
                    >
                      <span className="preset-pill-icon">{preset.icon}</span>
                      <span className="preset-pill-name">{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Upload MP3 */}
            {soundtrackMode === 'upload' && (
              <div className="soundtrack-tab-content fade-in">
                <p className="soundtrack-help">
                  Upload an audio file (.mp3, .m4a, .wav) from your device. Plays full length, completely offline with zero ads.
                </p>

                <input
                  ref={songInputRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={handleSongSelect}
                />

                <div className="song-file-picker-row">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => songInputRef.current?.click()}
                  >
                    <span>🎧</span>
                    <span>{songFileName ? `Selected: ${songFileName}` : 'Choose MP3 / Audio File'}</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Track Title (e.g. Abhi Na Jao Chhod Kar, Somewhere Over The Rainbow)"
                    value={soundtrackTitle}
                    onChange={(e) => setSoundtrackTitle(e.target.value)}
                    className="form-input flex-1"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Spotify Track */}
            {soundtrackMode === 'spotify' && (
              <div className="soundtrack-tab-content fade-in">
                <p className="soundtrack-help">
                  Paste any Spotify track link. We will pair it directly to their Memory Reel player.
                </p>

                <div className="spotify-input-row">
                  <span className="spotify-icon">🎧</span>
                  <input
                    type="text"
                    placeholder="Paste Spotify Link (e.g. https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT)"
                    value={spotifyUrl}
                    onChange={(e) => {
                      setSpotifyUrl(e.target.value);
                      if (!soundtrackTitle || soundtrackTitle === 'Peaceful Piano Dusk') {
                        setSoundtrackTitle('Their Spotify Song');
                      }
                    }}
                    className="form-input flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            STEP 4: SACRED HOLD-TO-LIGHT CEREMONY & FINALE
            ============================================================ */}
        <section className="offering-section offering-section--submit">
          <HoldToLightFlame
            onIgnited={handleIgnited}
            disabled={isSubmitting || !name.trim()}
            label="Hold to light their flame & watch Memory Reel"
          />

          {statusMessage && (
            <p className="offering-status-msg fade-in">{statusMessage}</p>
          )}

          <p className="offering-privacy-note">
            🔒 Privacy guarantee: Photographs, videos, and stories remain completely private and are never shared with public models or ad networks.
          </p>
        </section>
      </form>
    </div>
  );
}
