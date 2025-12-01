import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw, Lock, Unlock, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';
import { resetAllGameData, forceNewDay, getDateOffset } from '../utils/storage';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import './AdminPanel.css';

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dateOffset, setDateOffset] = useState(0);
  const [currentPathologies, setCurrentPathologies] = useState({});

  // Mot de passe simple (vous pouvez le changer)
  const ADMIN_PASSWORD = 'admin123';

  // Charger l'offset actuel et les pathologies
  useEffect(() => {
    if (isAuthenticated) {
      const offset = getDateOffset();
      setDateOffset(offset);
      // Afficher les pathologies actuelles pour chaque mode
      setCurrentPathologies({
        classic: getPathologyOfTheDay('classic'),
        quote: getPathologyOfTheDay('quote'),
        emoji: getPathologyOfTheDay('emoji')
      });
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      setMessage('');
      const offset = getDateOffset();
      setDateOffset(offset);
      setCurrentPathologies({
        classic: getPathologyOfTheDay('classic'),
        quote: getPathologyOfTheDay('quote'),
        emoji: getPathologyOfTheDay('emoji')
      });
    } else {
      setMessage('Mot de passe incorrect');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResetAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données de jeu ? Cette action est irréversible.')) {
      resetAllGameData();
      showMessage('Toutes les données de jeu ont été réinitialisées', 'success');
      // Rafraîchir les pathologies affichées
      setCurrentPathologies({
        classic: getPathologyOfTheDay('classic'),
        quote: getPathologyOfTheDay('quote'),
        emoji: getPathologyOfTheDay('emoji')
      });
    }
  };

  const handleForceNewDay = () => {
    if (window.confirm('Forcer un nouveau jour va réinitialiser tous les modes et permettre de rejouer immédiatement. Continuer ?')) {
      forceNewDay();
      const newOffset = getDateOffset();
      setDateOffset(newOffset);
      // Rafraîchir les pathologies affichées
      const newPathologies = {
        classic: getPathologyOfTheDay('classic'),
        quote: getPathologyOfTheDay('quote'),
        emoji: getPathologyOfTheDay('emoji')
      };
      setCurrentPathologies(newPathologies);
      showMessage(`Nouveau jour forcé ! Nouvelles pathologies chargées. Rechargement de la page...`, 'success');
      // Recharger la page après 2 secondes pour que le message s'affiche
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleResetOffset = () => {
    if (window.confirm('Réinitialiser l\'offset à 0 va restaurer la date normale. Continuer ?')) {
      localStorage.setItem('nursdle_date_offset', '0');
      setDateOffset(0);
      resetAllGameData();
      const newPathologies = {
        classic: getPathologyOfTheDay('classic'),
        quote: getPathologyOfTheDay('quote'),
        emoji: getPathologyOfTheDay('emoji')
      };
      setCurrentPathologies(newPathologies);
      showMessage('Offset réinitialisé ! Rechargement de la page...', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-panel">
        <motion.div
          className="admin-login"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="admin-lock-icon">
            <Lock size={48} />
          </div>
          <h2>Accès Administrateur</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-password-input"
              autoFocus
            />
            <button type="submit" className="admin-login-btn">
              Se connecter
            </button>
          </form>
          {message && (
            <div className={`admin-message admin-message-${messageType}`}>
              {messageType === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
              <span>{message}</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <motion.div
        className="admin-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="admin-header">
          <h2>Panneau d'Administration</h2>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="admin-logout-btn"
          >
            <Unlock size={20} />
            Déconnexion
          </button>
        </div>

        <div className="admin-actions">
          <div className="admin-card">
            <div className="admin-card-header">
              <Eye size={24} />
              <h3>Pathologies Actuelles</h3>
            </div>
            <div className="admin-pathologies-list">
              <div className="admin-pathology-item">
                <strong>Classic:</strong> {currentPathologies.classic?.name || 'Chargement...'}
              </div>
              <div className="admin-pathology-item">
                <strong>Quote:</strong> {currentPathologies.quote?.name || 'Chargement...'}
              </div>
              <div className="admin-pathology-item">
                <strong>Emoji:</strong> {currentPathologies.emoji?.name || 'Chargement...'}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <RefreshCw size={24} />
              <h3>Forcer un Nouveau Jour</h3>
            </div>
            <p className="admin-card-description">
              Réinitialise tous les modes de jeu et permet de rejouer immédiatement avec de nouveaux cas.
            </p>
            <div className="admin-offset-info">
              <span>Offset actuel : <strong>{dateOffset} jour{dateOffset !== 1 ? 's' : ''}</strong></span>
            </div>
            <button
              onClick={handleForceNewDay}
              className="admin-action-btn admin-action-primary"
            >
              <RefreshCw size={20} />
              Forcer un Nouveau Jour
            </button>
            {dateOffset !== 0 && (
              <button
                onClick={handleResetOffset}
                className="admin-action-btn admin-action-secondary"
                style={{ marginTop: '0.75rem' }}
              >
                <RotateCcw size={20} />
                Réinitialiser l'Offset
              </button>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <Trash2 size={24} />
              <h3>Réinitialiser Toutes les Données</h3>
            </div>
            <p className="admin-card-description">
              Supprime toutes les données de jeu sauvegardées (tous les modes, toutes les dates).
            </p>
            <button
              onClick={handleResetAll}
              className="admin-action-btn admin-action-danger"
            >
              <Trash2 size={20} />
              Réinitialiser Tout
            </button>
          </div>
        </div>

        {message && (
          <motion.div
            className={`admin-message admin-message-${messageType}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {messageType === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
            <span>{message}</span>
          </motion.div>
        )}

        <div className="admin-info">
          <p><strong>Note :</strong> Après avoir forcé un nouveau jour, rechargez la page pour voir les changements.</p>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminPanel;

