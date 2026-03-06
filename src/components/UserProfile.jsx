import { useState, useEffect } from 'react';
import { User, LogOut, Flame, Target, Trophy, BarChart3, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPlayerHistory } from '../utils/supabaseService';
import './UserProfile.css';

function UserProfile({ onBack }) {
  const { user, profile, signOut } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    const data = await getPlayerHistory(user.id, 20);
    setHistory(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  const getModeLabel = (mode) => {
    const labels = {
      classic: '🩺 Classique',
      quote: '💬 Citation',
      emoji: '😄 Emoji',
      image: '🖼️ Image',
    };
    return labels[mode] || mode;
  };

  if (!user || !profile) return null;

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* En-tête profil */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={32} />
          </div>
          <div className="profile-info">
            <h2 className="profile-username">{profile.username}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          <button className="profile-logout" onClick={handleSignOut}>
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <Target size={22} className="stat-icon" />
            <div className="stat-value">{profile.total_games || 0}</div>
            <div className="stat-label">Parties</div>
          </div>
          <div className="stat-card">
            <Trophy size={22} className="stat-icon stat-icon-wins" />
            <div className="stat-value">{profile.total_wins || 0}</div>
            <div className="stat-label">Victoires</div>
          </div>
          <div className="stat-card">
            <BarChart3 size={22} className="stat-icon stat-icon-rate" />
            <div className="stat-value">{profile.win_rate || 0}%</div>
            <div className="stat-label">Taux</div>
          </div>
          <div className="stat-card">
            <Flame size={22} className="stat-icon stat-icon-streak" />
            <div className="stat-value">{profile.current_streak || 0}</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>

        {/* Meilleur streak */}
        {(profile.best_streak || 0) > 0 && (
          <div className="profile-best-streak">
            🏆 Meilleur streak : <strong>{profile.best_streak} jours</strong>
          </div>
        )}

        {/* Historique */}
        <div className="profile-history">
          <h3 className="history-title">
            <History size={18} />
            Historique récent
          </h3>
          {loading ? (
            <div className="history-loading">Chargement...</div>
          ) : history.length === 0 ? (
            <div className="history-empty">Aucune partie jouée pour le moment</div>
          ) : (
            <div className="history-list">
              {history.map((entry, i) => (
                <div key={i} className={`history-row ${entry.won ? 'history-won' : 'history-lost'}`}>
                  <span className="history-date">{new Date(entry.played_at).toLocaleDateString('fr-FR')}</span>
                  <span className="history-mode">{getModeLabel(entry.mode)}</span>
                  <span className="history-result">
                    {entry.won ? `✓ ${entry.attempts} essai${entry.attempts > 1 ? 's' : ''}` : '✗ Perdu'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

