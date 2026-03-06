import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import DuelLobby from './DuelLobby';
import DuelGame from './DuelGame';
import './DuelMode.css';

function DuelMode({ onNeedAuth }) {
  const { user, profile } = useAuth();
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // Si pas connecté, demander connexion
  if (!user || !profile) {
    return (
      <div className="duel-mode">
        <div className="duel-auth-needed">
          <h2>⚔️ Mode Duel</h2>
          <p>Connectez-vous pour jouer en multijoueur</p>
          <button className="duel-login-btn" onClick={onNeedAuth}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Si pas encore dans une room, montrer le lobby
  if (!roomId) {
    return (
      <DuelLobby
        user={user}
        profile={profile}
        onJoinRoom={(id, host) => {
          setRoomId(id);
          setIsHost(host);
        }}
      />
    );
  }

  // Sinon, montrer la partie
  return (
    <DuelGame
      roomId={roomId}
      user={user}
      profile={profile}
      isHost={isHost}
      onLeave={() => {
        setRoomId(null);
        setIsHost(false);
      }}
    />
  );
}

export default DuelMode;

