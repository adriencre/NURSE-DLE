import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import SearchBar from './SearchBar';
import AdSense from './AdSense';
import { pathologies } from '../data/pathologies';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import { saveGameState, getGameState, cleanOldData } from '../utils/storage';
import { saveGameResult } from '../utils/supabaseService';
import { useAuth } from '../contexts/useAuth';
import './EmojiMode.css';

function EmojiMode() {
  const [targetPathology, setTargetPathology] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  // Charger la pathologie du jour et l'état sauvegardé
  useEffect(() => {
    cleanOldData();
    const pathology = getPathologyOfTheDay('emoji');
    setTargetPathology(pathology);

    // Récupérer l'état sauvegardé
    const savedState = getGameState('emoji');
    if (savedState) {
      const savedGuesses = savedState.guessIds
        .map(id => pathologies.find(p => p.id === id))
        .filter(Boolean);
      setGuesses(savedGuesses);
      setIsWon(savedState.isWon);
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    if (isLoaded && targetPathology) {
      saveGameState('emoji', {
        guessIds: guesses.map(g => g.id),
        isWon: isWon
      });
    }
  }, [guesses, isWon, isLoaded, targetPathology]);

  const handleSelectPathology = (selectedPathology) => {
    if (!targetPathology || isWon) return;

    const newGuesses = [...guesses, selectedPathology];
    const won = selectedPathology.id === targetPathology.id;

    if (won) {
      setIsWon(true);
      if (user) {
        const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
        saveGameResult({
          userId: user.id,
          mode: 'emoji',
          pathologyId: targetPathology.id,
          attempts: newGuesses.length,
          won: true,
          timeTaken,
        });
      }
    }

    setGuesses(newGuesses);
  };

  if (!targetPathology || !isLoaded) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="emoji-mode">
      <div className="emoji-mode-container">
        <div className="mode-header">
          <h2>Mode Emoji</h2>
          <p className="mode-description">
            Devine la pathologie à partir des émojis
          </p>
        </div>

        <div className="emoji-card">
          <Smile className="emoji-icon" size={32} />
          <div className="emoji-display">
            {targetPathology.emojis.map((emoji, index) => (
              <span key={index} className="emoji-item">
                {emoji}
              </span>
            ))}
          </div>
          <p className="emoji-label">Quelle pathologie correspond à ces émojis ?</p>
        </div>

        {!isWon ? (
          <div className="search-section">
            <SearchBar
              onSelect={handleSelectPathology}
              options={pathologies}
              placeholder="Devine la pathologie..."
              excludedIds={guesses.map(g => g.id)}
            />
          </div>
        ) : (
          <div className="already-played-message">
            Vous avez déjà trouvé la pathologie du jour ! Revenez demain pour un nouveau défi.
          </div>
        )}

        {isWon && (
          <motion.div
            className="win-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🎉 Félicitations ! Vous avez trouvé : {targetPathology.name}
            <p className="win-stats">Trouvé en {guesses.length} essai{guesses.length > 1 ? 's' : ''}</p>
          </motion.div>
        )}

        {guesses.length > 0 && (
          <div className="guesses-list">
            <h3>Vos tentatives ({guesses.length}) :</h3>
            <ul>
              {guesses.map((guess, index) => (
                <li key={index} className={guess.id === targetPathology.id ? 'correct' : 'incorrect'}>
                  {guess.name} {guess.id === targetPathology.id ? '✓' : '✗'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Publicité */}
        <AdSense format="horizontal" slot="1234567890" />

        {guesses.length === 0 && !isWon && (
          <div className="empty-state">
            <p>Essayez de deviner la pathologie correspondant à ces émojis</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmojiMode;
