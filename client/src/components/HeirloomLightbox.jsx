import { useEffect } from 'react';
import CandleFlame from './CandleFlame';
import './HeirloomLightbox.css';

/**
 * HeirloomLightbox — High-resolution unclipped viewer for memory photos and altar display pictures.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the lightbox is visible
 * @param {string} props.mediaUrl - Image or video URL to inspect
 * @param {string} [props.title] - Person name or moment title
 * @param {string} [props.subtitle] - Relationship or spacetime coordinates
 * @param {string} [props.caption] - Heartfelt story or memory fragment text
 * @param {boolean} [props.isVideo] - Whether the media is video
 * @param {Function} props.onClose - Close callback
 */
export default function HeirloomLightbox({
  isOpen,
  mediaUrl,
  title,
  subtitle,
  caption,
  isVideo = false,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mediaUrl) return null;

  return (
    <div
      className="heirloom-lightbox-overlay fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Photograph viewer'}
    >
      <div
        className="heirloom-lightbox-container fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="lightbox-header">
          <div className="lightbox-title-group">
            <CandleFlame size="sm" />
            <div>
              <h3 className="lightbox-title">{title || 'Archival Photograph'}</h3>
              {subtitle && <p className="lightbox-subtitle">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            className="lightbox-close-btn"
            onClick={onClose}
            aria-label="Close photograph view"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Media Frame with Ambient Aura */}
        <div className="lightbox-media-frame">
          {!isVideo && (
            <div
              className="lightbox-blurred-aura"
              style={{ backgroundImage: `url(${mediaUrl})` }}
              aria-hidden="true"
            />
          )}

          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              className="lightbox-media-element"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={title || 'Full photograph'}
              className="lightbox-media-element"
            />
          )}
        </div>

        {/* Caption / Story if provided */}
        {caption && (
          <div className="lightbox-caption-box">
            <p className="lightbox-caption-text">“{caption}”</p>
          </div>
        )}
      </div>
    </div>
  );
}
