import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile } from 'lucide-react';
import SearchBar from './SearchBar';
import { pathologies } from '../data/pathologies';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import { saveGameState, getGameState, cleanOldData } from '../utils/storage';
import './EmojiMode.css';

function EmojiMode() {
  const [targetPathology, setTargetPathology] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger la pathologie du jour et l'état sauvegardé
  useEffect(() => {
    cleanOldData();
    const pathology = getPathologyOfTheDay();
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

    if (selectedPathology.id === targetPathology.id) {
      setIsWon(true);
    }

    setGuesses(prev => [...prev, selectedPathology]);
  };

  if (!targetPathology || !isLoaded) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="emoji-mode">
      <motion.div
        className="emoji-mode-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mode-header">
          <h2>Mode Emoji</h2>
          <p className="mode-description">
            Devine la pathologie à partir des émojis
          </p>
        </div>

        <motion.div
          className="emoji-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Smile className="emoji-icon" size={32} />
          <div className="emoji-display">
            {targetPathology.emojis.map((emoji, index) => (
              <motion.span
                key={index}
                className="emoji-item"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  type: 'spring',
                  stiffness: 200
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>
          <p className="emoji-label">Quelle pathologie correspond à ces émojis ?</p>
        </motion.div>

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

        {guesses.length === 0 && !isWon && (
          <div className="empty-state">
            <p>Essayez de deviner la pathologie correspondant à ces émojis</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default EmojiMode;
