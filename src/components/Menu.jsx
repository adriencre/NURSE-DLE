import { motion } from 'framer-motion';
import { Stethoscope, Quote, Image as ImageIcon, Smile } from 'lucide-react';
import './Menu.css';

function Menu({ onSelectMode }) {
  const modes = [
    {
      id: 'classic',
      name: 'Mode Classique',
      icon: Stethoscope,
      description: 'Devine la pathologie en comparant les caractéristiques',
      color: '#667eea',
      available: true
    },
    {
      id: 'quote',
      name: 'Mode Citation',
      icon: Quote,
      description: 'Devine à partir d\'une citation de patient',
      color: '#f093fb',
      available: true
    },
    {
      id: 'image',
      name: 'Mode Image',
      icon: ImageIcon,
      description: 'Devine à partir d\'une image floutée',
      color: '#4facfe',
      available: false,
      comingSoon: true
    },
    {
      id: 'emoji',
      name: 'Mode Emoji',
      icon: Smile,
      description: 'Devine à partir d\'émojis',
      color: '#43e97b',
      available: true
    }
  ];

  return (
    <div className="menu-container">
      <div className="menu-grid">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              className={`menu-card ${!mode.available ? 'menu-card-disabled' : ''}`}
              onClick={() => mode.available && onSelectMode(mode.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={mode.available ? { scale: 1.05, y: -5 } : {}}
              whileTap={mode.available ? { scale: 0.95 } : {}}
            >
              <div className="menu-card-icon" style={{ background: mode.available ? `linear-gradient(135deg, ${mode.color} 0%, ${mode.color}dd 100%)` : 'rgba(100, 100, 100, 0.3)' }}>
                <Icon size={32} />
              </div>
              <h3 className="menu-card-title">{mode.name}</h3>
              <p className="menu-card-description">
                {mode.comingSoon ? '🚧 En développement' : mode.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Menu;

