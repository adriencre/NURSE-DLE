import { motion } from 'framer-motion';
import GuessCell from './GuessCell';
import './GuessRow.css';

function GuessRow({ guess, answer }) {
  const columns = [
    { key: 'name' },
    { key: 'system' },
    { key: 'type' },
    { key: 'urgency' },
    { key: 'population' },
    { key: 'chronic' }
  ];

  const getMatchType = (guessValue, answerValue) => {
    if (!guessValue || !answerValue) return 'none';
    
    const guessLower = guessValue.toLowerCase().trim();
    const answerLower = answerValue.toLowerCase().trim();
    
    if (guessLower === answerLower) {
      return 'exact';
    }
    
    if (guessLower.includes(answerLower) || answerLower.includes(guessLower)) {
      return 'partial';
    }
    
    return 'none';
  };

  return (
    <motion.div
      className="guess-row"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {columns.map((column, index) => {
        const guessValue = guess[column.key] || '';
        const answerValue = answer[column.key] || '';
        const matchType = getMatchType(guessValue, answerValue);
        
        return (
          <GuessCell
            key={column.key}
            value={guessValue}
            matchType={matchType}
            delay={index * 0.1}
          />
        );
      })}
    </motion.div>
  );
}

export default GuessRow;

