import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import GuessRow from './GuessRow';
import TableHeaders from './TableHeaders';
import { pathologies } from '../data/pathologies';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import { saveGameState, getGameState, cleanOldData } from '../utils/storage';
import './ClassicMode.css';

function ClassicMode() {
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
    const savedState = getGameState('classic');
    if (savedState) {
      // Reconstituer les guesses à partir des IDs sauvegardés
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
      saveGameState('classic', {
        guessIds: guesses.map(g => g.id),
        isWon: isWon
      });
    }
  }, [guesses, isWon, isLoaded, targetPathology]);

  const handleSelectPathology = (selectedPathology) => {
    if (!targetPathology || isWon) return;

    const won = selectedPathology.id === targetPathology.id;
    if (won) {
      setIsWon(true);
    }

    setGuesses(prev => [...prev, selectedPathology]);
  };

  if (!targetPathology || !isLoaded) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="classic-mode">
      <motion.div
        className="classic-mode-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mode-header">
          <h2>Mode Classique</h2>
          <p className="mode-description">
            Devine la pathologie en comparant les caractéristiques
          </p>
        </div>

        {!isWon ? (
          <SearchBar
            onSelect={handleSelectPathology}
            options={pathologies}
            placeholder="Rechercher une pathologie..."
            excludedIds={guesses.map(g => g.id)}
          />
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

        <div className="guesses-container">
          <TableHeaders />
          {guesses.length === 0 && (
            <div className="empty-state">
              <p>Sélectionnez une pathologie pour commencer</p>
            </div>
          )}
          {guesses.map((guess, index) => (
            <GuessRow
              key={index}
              guess={guess}
              answer={targetPathology}
            />
          ))}
        </div>

        <div className="legend-section">
          <h3 className="legend-title">Légende des couleurs</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color legend-exact"></div>
              <span>Vert : Correspondance exacte</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-partial"></div>
              <span>Orange : Correspondance partielle</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-none"></div>
              <span>Rouge : Aucune correspondance</span>
            </div>
          </div>
        </div>

        {guesses.length > 0 && !isWon && (
          <div className="game-info">
            <p>Essais : {guesses.length}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ClassicMode;
