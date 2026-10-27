import { useState, useRef } from 'react';
import CandleFlame from './CandleFlame';
import './MemoryReelEditor.css';

/**
 * MemoryReelEditor — Creator & Manager for "The Memory Reel":
 * 1. Add Photo Slides with Heartfelt Stories and When/Where pinning
 * 2. Spotify-style Soundtrack Picker: Upload "Their Song" or pick Sanctuary Melodies
 * 3. Filmstrip of existing preserved moments
 * 
 * @param {Object} props
 * @param {string} props.profileId
 * @param {string} props.personName
 * @param {Array} props.existingSlides
 * @param {Object} props.currentSoundtrack
 * @param {Function} props.onClose
 * @param {Function} props.onReelUpdated
 */
export default function MemoryReelEditor({
  profileId,
  personName,
  existingSlides = [],
  currentSoundtrack = null,
  onClose,
  onReelUpdated,
}) {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'soundtrack' | 'manage'

  // New Slide Form State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Soundtrack Form State
  const [soundtrackTitle, setSoundtrackTitle] = useState(
    currentSoundtrack?.title || ''
  );
  const [selectedPreset, setSelectedPreset] = useState(
    currentSoundtrack?.presetType || 'piano_dusk'
  );
  const [songFile, setSongFile] = useState(null);
  const [songFileName, setSongFileName] = useState('');

  const photoInputRef = useRef(null);
  const songInputRef = useRef(null);

  // Handle Photo Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Handle Song Selection
  const handleSongSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSongFile(file);
      setSongFileName(file.name);
      if (!soundtrackTitle) {
        setSoundtrackTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setSelectedPreset('upload');
    }
  };

  // Save New Slide to Memory Reel
  const handleAddSlide = async (e) => {
    e?.preventDefault();
    if (!photoFile) {
      alert('Please select a photograph for this moment in the Memory Reel.');
      return;
    }
    if (!story.trim()) {
      alert('Please write the story or memory behind this photograph.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('Preserving moment in the Memory Reel...');

    try {
      const formData = new FormData();
      formData.append('profileId', profileId);
      formData.append('media', photoFile);
      formData.append('title', title.trim() || 'Memory Reel Moment');
      formData.append('story', story.trim());

      const timePlace = {
        when: when.trim() || undefined,
        where: where.trim() || undefined,
      };
      if (timePlace.when || timePlace.where) {
        formData.append('timePlace', JSON.stringify(timePlace));
      }
      formData.append('order', existingSlides.length + 1);

      const res = await fetch('/api/memories/reel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        // Reset form
        setPhotoFile(null);
        setPhotoPreview(null);
        setTitle('');
        setStory('');
        setWhen('');
        setWhere('');
        setStatusMsg('Moment preserved in Memory Reel!');

        // Refresh reel
        if (onReelUpdated) onReelUpdated();
        setTimeout(() => setStatusMsg(''), 2500);
      } else {
        throw new Error(data.error || 'Could not save slide');
      }
    } catch (err) {
      alert('Error saving slide: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Soundtrack
  const handleSaveSoundtrack = async () => {
    setIsSubmitting(true);
    setStatusMsg('Saving Memory Reel soundtrack...');

    try {
      const formData = new FormData();
      formData.append('profileId', profileId);
      formData.append(
        'title',
        soundtrackTitle.trim() ||
          (selectedPreset === 'upload' ? 'Their Favorite Song' : getPresetTitle(selectedPreset))
      );
      formData.append('presetType', selectedPreset);

      if (songFile) {
        formData.append('soundtrack', songFile);
      }

      const res = await fetch('/api/memories/reel/soundtrack', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg('Soundtrack updated!');
        if (onReelUpdated) onReelUpdated();
        setTimeout(() => setStatusMsg(''), 2500);
      } else {
        throw new Error(data.error || 'Failed to update soundtrack');
      }
    } catch (err) {
      alert('Error saving soundtrack: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Slide
  const handleDeleteSlide = async (slideId) => {
    if (!confirm('Remove this photo moment from the Memory Reel?')) return;

    try {
      const res = await fetch(`/api/memories/${slideId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onReelUpdated) onReelUpdated();
      }
    } catch (err) {
      alert('Could not remove slide: ' + err.message);
    }
  };

  const getPresetTitle = (presetKey) => {
    const presets = {
      piano_dusk: 'Peaceful Piano Dusk',
      classical_sarod: 'Twilight Sarod & Sitar',
      acoustic_strings: 'Warm Acoustic Strings',
      rain_chimes: 'Rain on Eaves & Wind Chime',
      none: 'Silent Sanctuary (Room Silence)',
    };
    return presets[presetKey] || 'Sanctuary Instrumental';
  };

  return (
    <div className="reel-editor-overlay fade-in" onClick={onClose}>
      <div className="reel-editor-card fade-in-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reel-editor-header">
          <div className="reel-header-title">
            <CandleFlame size="sm" />
            <div>
              <h3>The Memory Reel (स्मृति कथा)</h3>
              <p className="reel-header-sub">Curating moments of {personName}</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close editor">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="reel-editor-tabs">
          <button
            type="button"
            className={`reel-tab-btn ${activeTab === 'add' ? 'reel-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span>📷</span>
            <span>Add Moment ({existingSlides.length})</span>
          </button>

          <button
            type="button"
            className={`reel-tab-btn ${activeTab === 'soundtrack' ? 'reel-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('soundtrack')}
          >
            <span>🎵</span>
            <span>Their Song (Soundtrack)</span>
          </button>

          <button
            type="button"
            className={`reel-tab-btn ${activeTab === 'manage' ? 'reel-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <span>🎞️</span>
            <span>Filmstrip ({existingSlides.length})</span>
          </button>
        </div>

        {/* Tab 1: Add Slide */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddSlide} className="reel-form fade-in">
            {/* Photo Uploader */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            <div
              className={`reel-dropzone ${photoPreview ? 'reel-dropzone--has-photo' : ''}`}
              onClick={() => photoInputRef.current?.click()}
              title="Click to choose a photograph"
            >
              {photoPreview ? (
                <div className="dropzone-preview">
                  <img src={photoPreview} alt="Selected moment" />
                  <span className="dropzone-change-hint">Click to change photograph</span>
                </div>
              ) : (
                <div className="dropzone-empty">
                  <span className="dropzone-icon">📷</span>
                  <span className="dropzone-label">Choose a photograph of {personName}</span>
                  <span className="dropzone-sub">An authentic moment, a trip, a smile, or a cherished day</span>
                </div>
              )}
            </div>

            {/* Slide Title */}
            <div className="reel-form-group">
              <label htmlFor="slide-title">Moment Title</label>
              <input
                id="slide-title"
                type="text"
                placeholder="e.g. Rooftop in Shimla, 2016"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="reel-input"
              />
            </div>

            {/* The Story Behind the Photo */}
            <div className="reel-form-group">
              <label htmlFor="slide-story">
                The Story Behind This Photograph *
              </label>
              <textarea
                id="slide-story"
                rows={4}
                placeholder="What happened right before or after this photo was taken? What were they saying, laughing about, or wearing? What do you feel when you look at it?"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="reel-textarea"
                required
              />
            </div>

            {/* When & Where Spacetime Pinning */}
            <div className="reel-spacetime-grid">
              <div className="reel-form-group">
                <label htmlFor="slide-when">🗓️ When was this?</label>
                <input
                  id="slide-when"
                  type="text"
                  placeholder="e.g. Winter 2016"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className="reel-input"
                />
              </div>

              <div className="reel-form-group">
                <label htmlFor="slide-where">📍 Where were you?</label>
                <input
                  id="slide-where"
                  type="text"
                  placeholder="e.g. Balcony at twilight"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  className="reel-input"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="reel-actions-bar">
              {statusMsg && <span className="reel-status-msg">{statusMsg}</span>}
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isSubmitting || !photoFile || !story.trim()}
              >
                {isSubmitting ? 'Preserving...' : 'Add to Memory Reel'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Soundtrack Picker */}
        {activeTab === 'soundtrack' && (
          <div className="reel-soundtrack-panel fade-in">
            <p className="soundtrack-intro">
              Just like their personal soundtrack, choose a song or peaceful melody that plays softly in the background while watching their Memory Reel.
            </p>

            {/* Current Soundtrack Badge */}
            {currentSoundtrack && (
              <div className="current-track-badge">
                <span className="track-icon">🎵</span>
                <div>
                  <span className="track-status">Active Reel Soundtrack</span>
                  <h4 className="track-title">{currentSoundtrack.title}</h4>
                </div>
              </div>
            )}

            {/* Option 1: Upload Their Favorite Song */}
            <div className="soundtrack-section">
              <h4 className="soundtrack-section-title">Option 1: Upload "Their Song" (MP3 / Audio)</h4>
              <p className="soundtrack-section-sub">Their favorite vintage track, ghazal, acoustic song, or a recording of them.</p>

              <input
                ref={songInputRef}
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={handleSongSelect}
              />

              <div className="song-upload-row">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => songInputRef.current?.click()}
                >
                  <span>🎧</span>
                  <span>{songFileName ? `Selected: ${songFileName}` : 'Choose Audio File (.mp3, .m4a)'}</span>
                </button>

                {songFileName && (
                  <input
                    type="text"
                    placeholder="Song Title (e.g. Abhi Na Jao Chhod Kar)"
                    value={soundtrackTitle}
                    onChange={(e) => setSoundtrackTitle(e.target.value)}
                    className="reel-input flex-1"
                  />
                )}
              </div>
            </div>

            {/* Option 2: Curated Sanctuary Instrumentals */}
            <div className="soundtrack-section">
              <h4 className="soundtrack-section-title">Option 2: Sanctuary Acoustic Melodies</h4>
              <p className="soundtrack-section-sub">Zero downloads; procedural soothing acoustic melodies generated in real time.</p>

              <div className="presets-grid">
                {[
                  { key: 'piano_dusk', title: 'Peaceful Piano Dusk', icon: '🎹' },
                  { key: 'classical_sarod', title: 'Twilight Sarod & Sitar', icon: '🌙' },
                  { key: 'acoustic_strings', title: 'Warm Acoustic Strings', icon: '🎸' },
                  { key: 'rain_chimes', title: 'Rain & Wind Chimes', icon: '🌧️' },
                  { key: 'none', title: 'Silent (No Music)', icon: '🔇' },
                ].map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`preset-btn ${selectedPreset === preset.key ? 'preset-btn--active' : ''}`}
                    onClick={() => {
                      setSelectedPreset(preset.key);
                      setSongFile(null);
                      setSongFileName('');
                      setSoundtrackTitle(preset.title);
                    }}
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    <span className="preset-name">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Soundtrack Button */}
            <div className="reel-actions-bar">
              {statusMsg && <span className="reel-status-msg">{statusMsg}</span>}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveSoundtrack}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Set as Reel Soundtrack'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Filmstrip / Manage Slides */}
        {activeTab === 'manage' && (
          <div className="reel-manage-panel fade-in">
            {existingSlides.length === 0 ? (
              <div className="reel-empty-state">
                <span className="empty-icon">🎞️</span>
                <p>No photo moments in {personName}'s Memory Reel yet.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('add')}
                >
                  Add their first moment
                </button>
              </div>
            ) : (
              <div className="filmstrip-grid">
                {existingSlides.map((slide, index) => (
                  <div key={slide._id} className="filmstrip-card">
                    <div className="filmstrip-photo">
                      <img src={slide.mediaUrl} alt={slide.sourceLabel || 'Moment'} />
                      <span className="filmstrip-badge">#{index + 1}</span>
                    </div>

                    <div className="filmstrip-info">
                      <h4 className="filmstrip-title">{slide.sourceLabel || `Moment #${index + 1}`}</h4>
                      {slide.timePlace && (slide.timePlace.when || slide.timePlace.where) && (
                        <span className="filmstrip-pin">
                          {slide.timePlace.when && `🗓️ ${slide.timePlace.when}`}
                          {slide.timePlace.when && slide.timePlace.where && ' • '}
                          {slide.timePlace.where && `📍 ${slide.timePlace.where}`}
                        </span>
                      )}
                      <p className="filmstrip-snippet">"{slide.content}"</p>
                    </div>

                    <button
                      type="button"
                      className="filmstrip-delete-btn"
                      onClick={() => handleDeleteSlide(slide._id)}
                      title="Remove this moment from Memory Reel"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
