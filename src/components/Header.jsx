import { ArrowLeft } from 'lucide-react';
import './Header.css';

function Header({ showBack, onBack, title = "Nurse-dle" }) {
  return (
    <header className="header">
      {showBack && (
        <button className="back-button" onClick={onBack} aria-label="Retour au menu">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="header-title">{title}</h1>
    </header>
  );
}

export default Header;

