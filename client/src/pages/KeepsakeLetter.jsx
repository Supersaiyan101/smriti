import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import HeirloomLightbox from '../components/HeirloomLightbox';
import './KeepsakeLetter.css';

/**
 * KeepsakeLetter — Feature 5 (Screen & Print)
 * Archival heirloom page gathering their wisdom, photo, and words.
 * Features:
 *  - Deckled torn-paper parchment styling with subtle fold crease
 *  - Dimensional crimson/gold wax seal stamp with Sanskrit calligraphy (स्मृ)
 *  - High-resolution print styling for framing and physical remembrance
 */
export default function KeepsakeLetter() {
  const { id } = useParams();

  const [letterData, setLetterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);

  useEffect(() => {
    fetchLetterData();
  }, [id]);

  const fetchLetterData = async () => {
    try {
      const res = await fetch(`/api/letter/${id}`);
      const data = await res.json();
      if (data.success) {
        setLetterData(data.letter);
      } else {
        setError(data.error || 'Could not load keepsake letter');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="page letter-loading-page">
        <CandleFlame size="lg" />
        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Crafting the archival heirloom letter...
        </p>
      </div>
    );
  }

  if (error || !letterData) {
    return (
      <div className="page">
        <h2>Letter Not Found</h2>
        <Link to={`/remember/${id}`} className="btn btn-ghost" style={{ marginTop: '1rem' }}>
          ← Return to Remembrance
        </Link>
      </div>
    );
  }

  const { profile, featuredQuote, passage, closing, date, stories } = letterData;

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="page letter-page-wrapper">
      {/* Top Action Bar (Hidden in Print) */}
      <nav className="letter-actions no-print">
        <Link to={`/remember/${id}`} className="btn btn-ghost btn-sm">
          ← Back to Remembrance
        </Link>
        <button type="button" className="btn btn-primary btn-sm btn-print" onClick={handlePrint}>
          <span>🖨️</span>
          <span>Print / Save Keepsake</span>
        </button>
      </nav>

      {/* The Archival Heirloom Letter Page */}
      <article className="keepsake-letter" id="printable-letter">
        {/* Subtle Archival Fold Creases */}
        <div className="letter-crease letter-crease--horizontal" aria-hidden="true" />

        {/* Decorative Inner Archival Border */}
        <div className="letter-border">
          {/* Header Ornament */}
          <div className="letter-header">
            <span className="letter-ornament">🕯️</span>
            <span className="letter-tagline">IN PERPETUAL REMEMBRANCE</span>
            <div className="letter-filigree" aria-hidden="true">
              <span>✦</span>
              <span className="filigree-line" />
              <span>✦</span>
            </div>
          </div>

          {/* Portrait & Person Info */}
          <div className="letter-person">
            <div
              className={`letter-portrait ${profile.photoUrl ? 'letter-portrait--clickable' : ''}`}
              onClick={() => {
                if (profile.photoUrl) {
                  setLightboxMedia({
                    url: profile.photoUrl,
                    title: profile.name,
                    subtitle: `${profile.relationship} • Keepsake Portrait`,
                    caption: `In loving remembrance of ${profile.name}.`,
                    isVideo: false,
                  });
                }
              }}
              title={profile.photoUrl ? 'Click to inspect full portrait' : profile.name}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} />
              ) : (
                <span className="letter-initials">{initials}</span>
              )}
            </div>
            <h1 className="letter-name">{profile.name}</h1>
            <p className="letter-rel">
              {profile.relationship} • {date}
            </p>
          </div>

          {/* Featured Preserved Quote */}
          {featuredQuote && (
            <div className="letter-quote-box">
              <span className="quote-mark">“</span>
              <p className="quote-text">{featuredQuote}</p>
              <span className="quote-mark quote-mark--close">”</span>
            </div>
          )}

          {/* Main Passage synthesized by Gemma */}
          <div className="letter-passage">
            {passage.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Preserved Stories from their Memory Reel */}
          {stories && stories.length > 0 && (
            <div className="letter-stories-section">
              <div className="letter-stories-header">
                <span className="stories-ornament">✦</span>
                <span className="stories-label">STORIES EMBODIED IN THEIR MEMORY REEL</span>
                <span className="stories-ornament">✦</span>
              </div>
              <div className="letter-stories-list">
                {stories.map((story, i) => (
                  <div key={i} className="letter-story-item">
                    {story.mediaUrl && (
                      <div
                        className="letter-story-frame letter-story-frame--clickable"
                        onClick={() => {
                          setLightboxMedia({
                            url: story.mediaUrl,
                            title: story.title || 'Memory Reel Moment',
                            subtitle: [story.when, story.where].filter(Boolean).join(' • ') || `${profile.name}’s Memory`,
                            caption: story.story,
                            isVideo: story.type === 'video',
                          });
                        }}
                        title="Click to view full photograph"
                      >
                        {story.type === 'video' ? (
                          <video src={story.mediaUrl} muted preload="metadata" />
                        ) : (
                          <img src={story.mediaUrl} alt={story.title} />
                        )}
                        <span className="story-frame-zoom-hint">🔍</span>
                      </div>
                    )}
                    <div className="letter-story-content">
                      <h4 className="letter-story-heading">
                        {story.title}
                        {(story.when || story.where) && (
                          <span className="letter-story-meta">
                            {[story.when, story.where].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </h4>
                      <p className="letter-story-narrative">“{story.story}”</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing & Dimensional Sanskrit Wax Seal Stamp */}
          <div className="letter-footer">
            <p className="letter-closing">{closing}</p>

            {/* Dimensional Wax Seal Stamp */}
            <div className="wax-seal-wrapper" title="Sealed in perpetual remembrance">
              <div className="wax-seal">
                <div className="wax-seal__outer-ring" />
                <div className="wax-seal__inner-disc">
                  <span className="wax-seal__sanskrit">स्मृ</span>
                </div>
              </div>
              <span className="seal-text">SMRITI SANCTUARY • ARCHIVAL SEAL</span>
            </div>
          </div>
        </div>
      </article>

      {/* Lightbox for High-Resolution Photo and DP Inspection */}
      <HeirloomLightbox
        isOpen={!!lightboxMedia}
        mediaUrl={lightboxMedia?.url}
        title={lightboxMedia?.title}
        subtitle={lightboxMedia?.subtitle}
        caption={lightboxMedia?.caption}
        isVideo={lightboxMedia?.isVideo}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  );
}
