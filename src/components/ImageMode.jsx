import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import SearchBar from './SearchBar';
import { pathologies } from '../data/pathologies';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import { saveGameState, getGameState, cleanOldData } from '../utils/storage';
import './ImageMode.css';

function ImageMode() {
  const [targetPathology, setTargetPathology] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [blurLevel, setBlurLevel] = useState(20);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger la pathologie du jour et l'état sauvegardé
  useEffect(() => {
    cleanOldData();
    const pathology = getPathologyOfTheDay('image');
    setTargetPathology(pathology);

    // Récupérer l'état sauvegardé
    const savedState = getGameState('image');
    if (savedState) {
      const savedGuesses = savedState.guessIds
        .map(id => pathologies.find(p => p.id === id))
        .filter(Boolean);
      setGuesses(savedGuesses);
      setIsWon(savedState.isWon);
      if (savedState.isWon) {
        setBlurLevel(0);
      } else {
        setBlurLevel(Math.max(0, 20 - (savedGuesses.length * 4)));
      }
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    if (isLoaded && targetPathology) {
      saveGameState('image', {
        guessIds: guesses.map(g => g.id),
        isWon: isWon
      });
    }
  }, [guesses, isWon, isLoaded, targetPathology]);

  useEffect(() => {
    if (guesses.length > 0 && !isWon) {
      const newBlur = Math.max(0, 20 - (guesses.length * 4));
      setBlurLevel(newBlur);
    }
  }, [guesses.length, isWon]);

  const handleSelectPathology = (selectedPathology) => {
    if (!targetPathology || isWon) return;

    if (selectedPathology.id === targetPathology.id) {
      setIsWon(true);
      setBlurLevel(0);
    } else {
      setGuesses(prev => [...prev, selectedPathology]);
    }
  };

  if (!targetPathology || !isLoaded) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="image-mode">
      <motion.div
        className="image-mode-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mode-header">
          <h2>Mode Image</h2>
          <p className="mode-description">
            Devine la pathologie à partir de l'image floutée
          </p>
        </div>

        <motion.div
          className="image-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="image-wrapper">
            <img
              src={targetPathology.image}
              alt="Pathologie à deviner"
              className="pathology-image"
              style={{
                filter: `blur(${blurLevel}px)`,
                transition: 'filter 0.5s ease-out'
              }}
            />
            {blurLevel > 0 && !isWon && (
              <div className="blur-overlay">
                <ImageIcon size={48} />
                <p>Image floutée</p>
              </div>
            )}
          </div>
        </motion.div>

        {!isWon ? (
          <div className="search-section">
            <SearchBar
              onSelect={handleSelectPathology}
              options={pathologies}
              placeholder="Quelle pathologie correspond à cette image ?"
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
            <p className="win-stats">Trouvé en {guesses.length + 1} essai{guesses.length > 0 ? 's' : ''}</p>
          </motion.div>
        )}

        {guesses.length > 0 && !isWon && (
          <div className="guesses-info">
            <p>Erreurs : {guesses.length}</p>
            <p className="info-hint">
              💡 L'image devient plus nette à chaque erreur
            </p>
          </div>
        )}

        {guesses.length > 0 && (
          <div className="guesses-list">
            <h3>Vos tentatives :</h3>
            <ul>
              {guesses.map((guess, index) => (
                <li key={index} className="incorrect">
                  {guess.name} ✗
                </li>
              ))}
            </ul>
          </div>
        )}

        {guesses.length === 0 && !isWon && (
          <div className="empty-state">
            <p>Essayez de deviner la pathologie correspondant à cette image</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ImageMode;
