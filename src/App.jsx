import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Menu from './components/Menu';
import ClassicMode from './components/ClassicMode';
import QuoteMode from './components/QuoteMode';
import ComingSoon from './components/ComingSoon';
import EmojiMode from './components/EmojiMode';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import UserProfile from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
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
