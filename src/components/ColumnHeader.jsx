import { useState } from 'react';
import { Info } from 'lucide-react';
import './ColumnHeader.css';

function ColumnHeader({ label, description }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="column-header">
      <span className="header-label">{label}</span>
      <div
        className="info-icon-wrapper"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <Info size={16} className="info-icon" />
        {showTooltip && (
          <div className="tooltip">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export default ColumnHeader;

