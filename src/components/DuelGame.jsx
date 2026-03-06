import { useState, useEffect, useCallback, useRef } from 'react';
import { Crown, Users, Copy, Check, Play, LogOut, Trophy, Clock, Swords } from 'lucide-react';
import SearchBar from './SearchBar';
import TableHeaders from './TableHeaders';
import GuessRow from './GuessRow';
import { pathologies } from '../data/pathologies';
import {
  getRoom,
  getPlayers,
  startGame,
  startRound,
  playerFoundAnswer,
  leaveRoom,
  subscribeToRoom,
  unsubscribeFromRoom,
} from '../utils/duelService';
import './DuelMode.css';

function DuelGame({ roomId, user, isHost, onLeave }) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPathology, setCurrentPathology] = useState(null);
  const [roundGuesses, setRoundGuesses] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // { winnerId, winnerName, pathologyName }
  const [gameWinner, setGameWinner] = useState(null);
  const [copied, setCopied] = useState(false);
  const channelRef = useRef(null);
  const countdownRef = useRef(null);

  // Charger les données initiales
  const loadInitialData = useCallback(async () => {
    const roomData = await getRoom(roomId);
    const playersData = await getPlayers(roomId);
    if (roomData) setRoom(roomData);
    if (playersData) setPlayers(playersData);
  }, [roomId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Gérer les changements de room en temps réel
  const handleRoomChange = useCallback((newRoom) => {
    setRoom(newRoom);

    // Nouvelle manche : afficher la pathologie
    if (newRoom.round_active && newRoom.current_pathology_id) {
      const patho = pathologies.find(p => p.id === newRoom.current_pathology_id);
      setCurrentPathology(patho || null);
      setRoundResult(null);
      setRoundGuesses([]);
      setCountdown(null);
    }

    // Quelqu'un a trouvé : afficher le résultat
    if (!newRoom.round_active && newRoom.round_winner_id && newRoom.current_pathology_id) {
      const patho = pathologies.find(p => p.id === newRoom.current_pathology_id);
      setCurrentPathology(null);
      // Le nom du gagnant sera mis à jour via les players
      setRoundResult({
        winnerId: newRoom.round_winner_id,
        pathologyName: patho?.name || 'Inconnue',
      });

      // Si la partie n'est pas terminée, lancer le countdown puis la prochaine manche
      if (newRoom.status === 'playing') {
        setCountdown(5);
      }
    }

    // Partie terminée
    if (newRoom.status === 'finished') {
      setCountdown(null);
      setCurrentPathology(null);
    }
  }, []);

  const handlePlayersChange = useCallback((newPlayers) => {
    setPlayers(newPlayers);

    // Mettre à jour le nom du gagnant du round
    setRoundResult(prev => {
      if (prev && prev.winnerId) {
        const winner = newPlayers.find(p => p.user_id === prev.winnerId);
        return { ...prev, winnerName: winner?.username || 'Inconnu' };
      }
      return prev;
    });

    // Vérifier s'il y a un gagnant de la partie
    setRoom(currentRoom => {
      if (currentRoom?.status === 'finished') {
        const sorted = [...newPlayers].sort((a, b) => b.score - a.score);
        if (sorted.length > 0) {
          setGameWinner(sorted[0]);
        }
      }
      return currentRoom;
    });
  }, []);

  // Souscrire aux changements en temps réel
  useEffect(() => {
    channelRef.current = subscribeToRoom(roomId, handleRoomChange, handlePlayersChange);

    return () => {
      unsubscribeFromRoom(channelRef.current);
    };
  }, [roomId, handleRoomChange, handlePlayersChange]);

  // Countdown entre les manches
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      setCountdown(null);
      // L'hôte lance la prochaine manche
      if (isHost) {
        startRound(roomId);
      }
      return;
    }

    countdownRef.current = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown, isHost, roomId]);

  // Deviner une pathologie
  const handleGuess = useCallback(async (selectedPathology) => {
    if (!room || !room.round_active || !currentPathology) return;

    setRoundGuesses(prev => [...prev, selectedPathology]);

    if (selectedPathology.id === currentPathology.id) {
      await playerFoundAnswer(roomId, user.id, currentPathology.id);
    }
  }, [room, currentPathology, roomId, user.id]);

  // Copier le code
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Quitter le salon
  const handleLeave = async () => {
    await leaveRoom(roomId, user.id);
    unsubscribeFromRoom(channelRef.current);
    onLeave();
  };

  // Lancer la partie (hôte)
  const handleStartGame = () => {
    if (isHost && players.length >= 2) {
      startGame(roomId);
    }
  };

  if (!room) {
    return <div className="duel-mode"><div className="duel-loading">Chargement...</div></div>;
  }

  // === ÉCRAN D'ATTENTE ===
  if (room.status === 'waiting') {
    return (
      <div className="duel-mode">
        <div className="duel-container">
          <div className="duel-waiting-header">
            <Swords size={28} className="duel-icon" />
            <h2>Salon de duel</h2>
          </div>

          <div className="duel-code-display">
            <span className="duel-code-label">Code du salon</span>
            <div className="duel-code-box">
              <span className="duel-code-text">{roomId.toUpperCase()}</span>
              <button className="duel-code-copy" onClick={handleCopy}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <span className="duel-code-hint">Partagez ce code avec vos amis !</span>
          </div>

          <div className="duel-players-list">
            <h3><Users size={18} /> Joueurs ({players.length}/{room.max_players})</h3>
            {players.map((p) => (
              <div key={p.user_id} className={`duel-player-row ${p.user_id === room.host_id ? 'duel-player-host' : ''}`}>
                <span className="duel-player-name">
                  {p.user_id === room.host_id && <Crown size={14} className="duel-crown" />}
                  {p.username}
                </span>
                {p.user_id === user.id && <span className="duel-player-you">(vous)</span>}
              </div>
            ))}
          </div>

          <div className="duel-settings-info">
            <span>🏆 Premier à {room.wins_needed} victoires</span>
            <span>👥 Max {room.max_players} joueurs</span>
          </div>

          <div className="duel-waiting-actions">
            {isHost ? (
              <button
                className="duel-btn-primary duel-btn-start"
                onClick={handleStartGame}
                disabled={players.length < 2}
              >
                <Play size={20} />
                {players.length < 2 ? 'En attente de joueurs...' : 'Lancer la partie !'}
              </button>
            ) : (
              <div className="duel-waiting-msg">
                <Clock size={18} />
                En attente que l'hôte lance la partie...
              </div>
            )}
            <button className="duel-btn-leave" onClick={handleLeave}>
              <LogOut size={16} />
              Quitter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === PARTIE TERMINÉE ===
  if (room.status === 'finished' && gameWinner) {
    return (
      <div className="duel-mode">
        <div className="duel-container">
          <div className="duel-finished">
            <Trophy size={48} className="duel-trophy-icon" />
            <h2>Partie terminée !</h2>
            <div className="duel-winner-card">
              <Crown size={24} className="duel-crown-big" />
              <span className="duel-winner-name">{gameWinner.username}</span>
              <span className="duel-winner-score">{gameWinner.score} victoires</span>
              {gameWinner.user_id === user.id && (
                <span className="duel-winner-you">🎉 C'est vous !</span>
              )}
            </div>

            <div className="duel-final-scores">
              <h3>Scores finaux</h3>
              {players.map((p, i) => (
                <div key={p.user_id} className={`duel-score-row ${i === 0 ? 'duel-score-first' : ''}`}>
                  <span className="duel-score-rank">#{i + 1}</span>
                  <span className="duel-score-name">{p.username}</span>
                  <span className="duel-score-value">{p.score}/{room.wins_needed}</span>
                </div>
              ))}
            </div>

            <button className="duel-btn-primary" onClick={handleLeave}>
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === PARTIE EN COURS ===
  return (
    <div className="duel-mode">
      <div className="duel-container">
        {/* Scoreboard en haut */}
        <div className="duel-scoreboard">
          {players.map((p) => (
            <div
              key={p.user_id}
              className={`duel-sb-player ${p.user_id === user.id ? 'duel-sb-me' : ''} ${p.has_found ? 'duel-sb-found' : ''} ${roundResult?.winnerId === p.user_id ? 'duel-sb-winner' : ''}`}
            >
              <span className="duel-sb-name">{p.username}</span>
              <span className="duel-sb-score">{p.score}</span>
            </div>
          ))}
        </div>

        {/* Info manche */}
        <div className="duel-round-info">
          Manche {room.current_round} • Premier à {room.wins_needed}
        </div>

        {/* Countdown entre les manches */}
        {countdown !== null && (
          <div className="duel-countdown">
            <div className="duel-countdown-number">{countdown}</div>
            <p>Prochaine manche dans...</p>
          </div>
        )}

        {/* Résultat de la manche */}
        {roundResult && !countdown && room.status === 'playing' && (
          <div className="duel-round-result">
            <p className="duel-round-winner-text">
              {roundResult.winnerId === user.id
                ? '🎉 Vous avez trouvé !'
                : `${roundResult.winnerName || '...'} a trouvé !`
              }
            </p>
            <p className="duel-round-answer">La réponse était : <strong>{roundResult.pathologyName}</strong></p>
          </div>
        )}

        {/* Zone de jeu style classique */}
        {currentPathology && room.round_active && (
          <div className="duel-game-area">
            <SearchBar
              onSelect={handleGuess}
              options={pathologies}
              placeholder="Rechercher une pathologie..."
              excludedIds={roundGuesses.map(g => g.id)}
            />

            <div className="duel-classic-table">
              <TableHeaders />
              {roundGuesses.length === 0 && (
                <div className="duel-classic-empty">
                  Sélectionnez une pathologie pour commencer
                </div>
              )}
              <div className="duel-classic-rows">
                {roundGuesses.map((guess, index) => (
                  <GuessRow
                    key={`${guess.id}-${index}`}
                    guess={guess}
                    answer={currentPathology}
                  />
                ))}
              </div>
            </div>

            {roundGuesses.length > 0 && (
              <div className="duel-guesses">
                <p>{roundGuesses.length} essai{roundGuesses.length > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        )}

        {/* Bouton quitter */}
        <button className="duel-btn-leave duel-btn-leave-small" onClick={handleLeave}>
          <LogOut size={14} />
          Quitter
        </button>
      </div>
    </div>
  );
}

export default DuelGame;

