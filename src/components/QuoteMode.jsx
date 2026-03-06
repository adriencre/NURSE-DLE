import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Lightbulb } from 'lucide-react';
import SearchBar from './SearchBar';
import AdSense from './AdSense';
import { pathologies } from '../data/pathologies';
import { getPathologyOfTheDay } from '../utils/gameLogic';
import { saveGameState, getGameState, cleanOldData } from '../utils/storage';
import { saveGameResult } from '../utils/supabaseService';
import { useAuth } from '../contexts/useAuth';
import './QuoteMode.css';

function QuoteMode() {
  const [targetPathology, setTargetPathology] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  // Charger la pathologie du jour et l'état sauvegardé
  useEffect(() => {
    cleanOldData();
    const pathology = getPathologyOfTheDay('quote');
    setTargetPathology(pathology);

    // Récupérer l'état sauvegardé
    const savedState = getGameState('quote');
    if (savedState) {
      const savedGuesses = savedState.guessIds
        .map(id => pathologies.find(p => p.id === id))
        .filter(Boolean);
      setGuesses(savedGuesses);
      setIsWon(savedState.isWon);
      if (savedGuesses.length >= 3 && !savedState.isWon) {
        setShowHint(true);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    if (isLoaded && targetPathology) {
      saveGameState('quote', {
        guessIds: guesses.map(g => g.id),
        isWon: isWon
      });
    }
  }, [guesses, isWon, isLoaded, targetPathology]);

  useEffect(() => {
    if (guesses.length >= 3 && !isWon) {
      setShowHint(true);
    }
  }, [guesses.length, isWon]);

  const handleSelectPathology = (selectedPathology) => {
    if (!targetPathology || isWon) return;

    const newGuesses = [...guesses, selectedPathology];
    const won = selectedPathology.id === targetPathology.id;

    if (won) {
      setIsWon(true);
      setShowHint(false);
      if (user) {
        const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
        saveGameResult({
          userId: user.id,
          mode: 'quote',
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
    <div className="quote-mode">
      <div className="quote-mode-container">
        <div className="mode-header">
          <h2>Mode Citation</h2>
          <p className="mode-description">
            Devine la pathologie à partir de la citation du patient
          </p>
        </div>

        <div className="quote-card">
          <MessageSquare className="quote-icon" size={32} />
          <blockquote className="quote-text">
            "{targetPathology.quote}"
          </blockquote>
          <p className="quote-label">— Citation d'un patient</p>
        </div>

        {!isWon ? (
          <div className="search-section">
            <SearchBar
              onSelect={handleSelectPathology}
              options={pathologies}
              placeholder="Quelle pathologie correspond à cette citation ?"
              excludedIds={guesses.map(g => g.id)}
            />
          </div>
        ) : (
          <div className="already-played-message">
            Vous avez déjà trouvé la pathologie du jour ! Revenez demain pour un nouveau défi.
          </div>
        )}

        {showHint && !isWon && (
          <div className="hint-card">
            <Lightbulb className="hint-icon" size={24} />
            <div className="hint-content">
              <h3>Indice</h3>
              <p>Système : <strong>{targetPathology.system}</strong></p>
              <p>Type : <strong>{targetPathology.type}</strong></p>
            </div>
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
            <p>Essayez de deviner la pathologie correspondant à cette citation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuoteMode;
