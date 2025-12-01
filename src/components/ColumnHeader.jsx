import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import './ColumnHeader.css';

function ColumnHeader({ label, description }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const updatePosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = () => {
    if (!showTooltip) {
      updatePosition();
    }
    setShowTooltip(prev => !prev);
  };

  useEffect(() => {
    if (showTooltip) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [showTooltip]);

  return (
    <>
      <div className="column-header">
        <span className="header-label">{label}</span>
        <div
          ref={iconRef}
          className="info-icon-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onTouchStart={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`Information sur ${label}`}
        >
          <Info size={16} className="info-icon" />
        </div>
      </div>
      {showTooltip && typeof document !== 'undefined' && createPortal(
        <div 
          className="tooltip" 
          role="tooltip"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {description}
        </div>,
        document.body
      )}
    </>
  );
}

export default ColumnHeader;

