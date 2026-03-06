import { ArrowLeft, LogIn, User } from 'lucide-react';
import './Header.css';

function Header({ showBack, onBack, title = "Nurse-dle", user, onOpenAuth, onOpenProfile }) {
  return (
    <header className="header">
      {showBack && (
        <button className="back-button" onClick={onBack} aria-label="Retour au menu">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        {user ? (
          <button className="header-profile-btn" onClick={onOpenProfile} aria-label="Mon profil">
            <User size={20} />
          </button>
        ) : (
          <button className="header-login-btn" onClick={onOpenAuth} aria-label="Se connecter">
            <LogIn size={18} />
            <span className="header-login-text">Connexion</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;

