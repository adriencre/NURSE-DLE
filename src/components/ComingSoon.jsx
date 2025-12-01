import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import './ComingSoon.css';

function ComingSoon({ modeName }) {
  return (
    <div className="coming-soon">
      <motion.div
        className="coming-soon-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Construction className="coming-soon-icon" size={64} />
        <h2>En Développement</h2>
        <p className="coming-soon-message">
          Le {modeName} est actuellement en cours de développement.
        </p>
        <p className="coming-soon-subtitle">
          Revenez bientôt pour découvrir cette nouvelle fonctionnalité !
        </p>
      </motion.div>
    </div>
  );
}

export default ComingSoon;

