import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandleFlame from '../components/CandleFlame';
import './KeepsakeLetter.css';

/**
 * KeepsakeLetter — Feature 5
 * A single printable, beautifully formatted heirloom page
 * gathering their wisdom, photo, and words.
 */
export default function KeepsakeLetter() {
  const { id } = useParams();

  const [letterData, setLetterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          Crafting the heirloom letter...
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

  const { profile, featuredQuote, passage, closing, date } = letterData;

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

      {/* The Printable Heirloom Letter Page */}
      <article className="keepsake-letter" id="printable-letter">
        {/* Decorative Inner Border */}
        <div className="letter-border">
          {/* Header Ornament */}
          <div className="letter-header">
            <span className="letter-ornament">🕯️</span>
            <span className="letter-tagline">IN LOVING REMEMBRANCE</span>
          </div>

          {/* Portrait & Person Info */}
          <div className="letter-person">
            <div className="letter-portrait">
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

          {/* Closing & Footer */}
          <div className="letter-footer">
            <p className="letter-closing">{closing}</p>
            <div className="letter-seal">
              <span className="seal-text">स्मृति • SMRITI SANCTUARY</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
