import { Stethoscope, Quote, Image as ImageIcon, Smile, Trophy, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdSense from './AdSense';
import './Menu.css';

function Menu({ onSelectMode, onOpenLeaderboard, onOpenProfile, onOpenAuth }) {
  const { user } = useAuth();
  const modes = [
    {
      id: 'classic',
      name: 'Mode Classique',
      icon: Stethoscope,
      description: 'Devine la pathologie en comparant les caractéristiques',
      color: '#667eea',
      available: true
    },
    {
      id: 'quote',
      name: 'Mode Citation',
      icon: Quote,
      description: 'Devine à partir d\'une citation de patient',
      color: '#f093fb',
      available: true
    },
    {
      id: 'image',
      name: 'Mode Image',
      icon: ImageIcon,
      description: 'Devine à partir d\'une image floutée',
      color: '#4facfe',
      available: false,
      comingSoon: true
    },
    {
      id: 'emoji',
      name: 'Mode Emoji',
      icon: Smile,
      description: 'Devine à partir d\'émojis',
      color: '#43e97b',
      available: true
    }
  ];

  return (
    <div className="menu-container">
      <div className="game-description">
        <h2 className="game-title">Nurse-dle</h2>
        <p className="game-subtitle">
          Le jeu de devinette pour étudiants infirmiers
        </p>
        <div className="game-description-content">
          <p>
            Testez vos connaissances médicales en devinant les <strong>pathologies du jour</strong> ! 
            Chaque mode de jeu propose sa propre pathologie quotidienne. Relevez les 4 défis chaque jour 
            pour améliorer vos compétences cliniques.
          </p>
          <div className="game-features">
            <span className="feature-item">🎯 4 pathologie par jour (1 par mode)</span>
            <span className="feature-item">📚 210 pathologies disponibles</span>
            <span className="feature-item">💾 Progression sauvegardée</span>
            <span className="feature-item">🔄 Nouveau défi quotidien</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="menu-actions">
        <button
          className="menu-action-btn menu-action-leaderboard"
          onClick={onOpenLeaderboard}
        >
          <Trophy size={20} />
          Classement
        </button>
        <button
          className="menu-action-btn menu-action-profile"
          onClick={user ? onOpenProfile : onOpenAuth}
        >
          <User size={20} />
          {user ? 'Mon Profil' : 'Se connecter'}
        </button>
      </div>

      <div className="menu-grid">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <div
              key={mode.id}
              className={`menu-card ${!mode.available ? 'menu-card-disabled' : ''}`}
              onClick={() => mode.available && onSelectMode(mode.id)}
            >
              <div className="menu-card-icon" style={{ background: mode.available ? `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}dd 100%)` : 'rgba(100, 100, 100, 0.3)' }}>
                <Icon size={32} />
              </div>
              <h3 className="menu-card-title">{mode.name}</h3>
              <p className="menu-card-description">
                {mode.comingSoon ? '🚧 En développement' : mode.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Publicité en bas du menu */}
      <AdSense format="horizontal" slot="1234567890" />
    </div>
  );
}

export default Menu;

