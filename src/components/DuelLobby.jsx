import { useState } from 'react';
import { Swords, Plus, LogIn, Users, Trophy } from 'lucide-react';
import { createRoom, joinRoom } from '../utils/duelService';
import './DuelMode.css';

function DuelLobby({ user, profile, onJoinRoom }) {
  const [view, setView] = useState('menu'); // 'menu' | 'create' | 'join'
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [winsNeeded, setWinsNeeded] = useState(5);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const { room, error: err } = await createRoom(
      user.id,
      profile.username,
      maxPlayers,
      winsNeeded
    );
    setLoading(false);

    if (err) {
      setError('Erreur lors de la création du salon');
      return;
    }

    // Rejoindre directement la room en tant qu'hôte
    onJoinRoom(room.id, true);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError('Entrez un code de salon');
      return;
    }
    setLoading(true);
    setError('');
    const { room, error: err } = await joinRoom(
      joinCode.trim(),
      user.id,
      profile.username
    );
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    onJoinRoom(room.id, false);
  };

  if (view === 'menu') {
    return (
      <div className="duel-mode">
        <div className="duel-lobby">
          <div className="duel-lobby-header">
            <Swords size={32} className="duel-icon" />
            <h2>Mode Duel</h2>
            <p className="duel-subtitle">
              Affrontez vos amis en temps réel !<br />
              Le premier à 5 victoires gagne.
            </p>
          </div>

          <div className="duel-lobby-actions">
            <button className="duel-btn duel-btn-create" onClick={() => setView('create')}>
              <Plus size={22} />
              <div>
                <span className="duel-btn-title">Créer un salon</span>
                <span className="duel-btn-desc">Invitez vos amis avec un code</span>
              </div>
            </button>

            <button className="duel-btn duel-btn-join" onClick={() => setView('join')}>
              <LogIn size={22} />
              <div>
                <span className="duel-btn-title">Rejoindre un salon</span>
                <span className="duel-btn-desc">Entrez le code d'un ami</span>
              </div>
            </button>
          </div>

          <div className="duel-rules">
            <h3>📋 Règles</h3>
            <ul>
              <li>Une pathologie apparaît pour tous les joueurs en même temps</li>
              <li>Le premier à trouver marque 1 point</li>
              <li>5 secondes de pause entre chaque manche</li>
              <li>Le premier à 5 points gagne la partie</li>
              <li>Jusqu'à 10 joueurs par salon !</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="duel-mode">
        <div className="duel-lobby">
          <div className="duel-lobby-header">
            <Plus size={28} className="duel-icon" />
            <h2>Créer un salon</h2>
          </div>

          <div className="duel-form">
            <div className="duel-field">
              <label>
                <Users size={16} />
                Nombre max de joueurs
              </label>
              <div className="duel-slider-row">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                  className="duel-slider"
                />
                <span className="duel-slider-value">{maxPlayers}</span>
              </div>
            </div>

            <div className="duel-field">
              <label>
                <Trophy size={16} />
                Victoires pour gagner
              </label>
              <div className="duel-slider-row">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={winsNeeded}
                  onChange={(e) => setWinsNeeded(parseInt(e.target.value))}
                  className="duel-slider"
                />
                <span className="duel-slider-value">{winsNeeded}</span>
              </div>
            </div>

            {error && <div className="duel-error">{error}</div>}

            <div className="duel-form-actions">
              <button className="duel-btn-secondary" onClick={() => { setView('menu'); setError(''); }}>
                Retour
              </button>
              <button className="duel-btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? 'Création...' : 'Créer le salon'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div className="duel-mode">
        <div className="duel-lobby">
          <div className="duel-lobby-header">
            <LogIn size={28} className="duel-icon" />
            <h2>Rejoindre un salon</h2>
          </div>

          <div className="duel-form">
            <div className="duel-field">
              <label>Code du salon</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ex: A1B2C3"
                className="duel-input duel-code-input"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && <div className="duel-error">{error}</div>}

            <div className="duel-form-actions">
              <button className="duel-btn-secondary" onClick={() => { setView('menu'); setError(''); }}>
                Retour
              </button>
              <button className="duel-btn-primary" onClick={handleJoin} disabled={loading || !joinCode.trim()}>
                {loading ? 'Connexion...' : 'Rejoindre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default DuelLobby;

