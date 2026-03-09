import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Menu from './components/Menu';
import ClassicMode from './components/ClassicMode';
import QuoteMode from './components/QuoteMode';
import ComingSoon from './components/ComingSoon';
import EmojiMode from './components/EmojiMode';
import DuelMode from './components/DuelMode';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import UserProfile from './components/UserProfile';
import SEOHead from './components/SEOHead';
import { useAuth } from './contexts/useAuth';
import './App.css';

function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuth();

  // Détection du raccourci clavier pour accéder à l'admin
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+A pour accéder à l'admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(true);
        setCurrentMode(null);
        setShowLeaderboard(false);
        setShowProfile(false);
      }
      // Échap pour quitter l'admin
      if (e.key === 'Escape' && showAdmin) {
        setShowAdmin(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdmin]);

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);
    setShowAdmin(false);
    setShowLeaderboard(false);
    setShowProfile(false);
  };

  const handleBackToMenu = () => {
    setCurrentMode(null);
    setShowAdmin(false);
    setShowLeaderboard(false);
    setShowProfile(false);
  };

  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
    setCurrentMode(null);
    setShowAdmin(false);
    setShowProfile(false);
  };

  const handleOpenProfile = () => {
    if (user) {
      setShowProfile(true);
      setCurrentMode(null);
      setShowAdmin(false);
      setShowLeaderboard(false);
    } else {
      setShowAuth(true);
    }
  };

  const getSEOData = () => {
    if (showLeaderboard) {
      return {
        title: 'Classement — Nurse-dle',
        description: 'Consultez le classement des meilleurs joueurs de Nurse-dle. Comparez vos scores avec les autres étudiants infirmiers.',
      };
    }
    if (showProfile) {
      return {
        title: 'Mon Profil — Nurse-dle',
        description: 'Consultez votre profil, vos statistiques et votre progression sur Nurse-dle.',
      };
    }
    switch (currentMode) {
      case 'classic':
        return {
          title: 'Mode Classique — Nurse-dle | Devinez la pathologie du jour',
          description: 'Devinez la pathologie du jour en comparant les caractéristiques. Mode classique de Nurse-dle pour tester vos connaissances en pathologie.',
        };
      case 'quote':
        return {
          title: 'Mode Citation — Nurse-dle | Devinez la pathologie à partir d\'une citation',
          description: 'Devinez la pathologie à partir d\'une citation de patient. Mode Citation de Nurse-dle pour étudiants infirmiers.',
        };
      case 'emoji':
        return {
          title: 'Mode Emoji — Nurse-dle | Devinez la pathologie à partir d\'émojis',
          description: 'Devinez la pathologie à partir d\'émojis. Mode Emoji de Nurse-dle, un défi amusant pour étudiants infirmiers.',
        };
      case 'duel':
        return {
          title: 'Mode Duel — Nurse-dle | Affrontez vos amis en temps réel',
          description: 'Affrontez vos amis en duel multijoueur en temps réel ! Jusqu\'à 10 joueurs par partie sur Nurse-dle.',
        };
      case 'image':
        return {
          title: 'Mode Image — Nurse-dle | Devinez la pathologie à partir d\'une image',
          description: 'Devinez la pathologie à partir d\'une image floutée. Mode Image de Nurse-dle (bientôt disponible).',
        };
      default:
        return {};
    }
  };

  const renderMode = () => {
    if (showAdmin) {
      return <AdminPanel />;
    }
    if (showLeaderboard) {
      return <Leaderboard onBack={handleBackToMenu} />;
    }
    if (showProfile) {
      return <UserProfile onBack={handleBackToMenu} />;
    }

    switch (currentMode) {
      case 'classic':
        return <ClassicMode />;
      case 'quote':
        return <QuoteMode />;
      case 'image':
        return <ComingSoon modeName="Mode Image" />;
      case 'emoji':
        return <EmojiMode />;
      case 'duel':
        return <DuelMode onNeedAuth={() => setShowAuth(true)} />;
      default:
        return (
          <Menu
            onSelectMode={handleSelectMode}
            onOpenLeaderboard={handleOpenLeaderboard}
            onOpenProfile={handleOpenProfile}
            onOpenAuth={() => setShowAuth(true)}
          />
        );
    }
  };

  return (
    <div className="app">
      <SEOHead {...getSEOData()} />
      <Header
        showBack={currentMode !== null || showAdmin || showLeaderboard || showProfile}
        onBack={handleBackToMenu}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onOpenProfile={handleOpenProfile}
      />
      <main className="main-content">
        {renderMode()}
      </main>

      <AnimatePresence>
        {showAuth && (
          <AuthModal onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
