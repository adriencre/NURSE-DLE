import { motion } from 'framer-motion';
import './GuessCell.css';

function GuessCell({ value, matchType, delay = 0 }) {
  const getColorClass = () => {
    switch (matchType) {
      case 'exact':
        return 'cell-exact';
      case 'partial':
        return 'cell-partial';
      case 'none':
        return 'cell-none';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`guess-cell ${getColorClass()}`}
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{
        delay: delay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <div className="cell-content">
        {value || ''}
      </div>
    </motion.div>
  );
}

export default GuessCell;

