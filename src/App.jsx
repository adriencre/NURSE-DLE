import { useState, useEffect } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import ClassicMode from './components/ClassicMode';
import QuoteMode from './components/QuoteMode';
import ComingSoon from './components/ComingSoon';
import EmojiMode from './components/EmojiMode';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Détection du raccourci clavier pour accéder à l'admin
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+Shift+A pour accéder à l'admin
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdmin(true);
        setCurrentMode(null);
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
  };

  const handleBackToMenu = () => {
    setCurrentMode(null);
    setShowAdmin(false);
  };

  const renderMode = () => {
    if (showAdmin) {
      return <AdminPanel />;
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
        return <Menu onSelectMode={handleSelectMode} />;
    }
  };

  return (
    <div className="app">
      <Header 
        showBack={currentMode !== null || showAdmin} 
        onBack={handleBackToMenu}
      />
      <main className="main-content">
        {renderMode()}
      </main>
    </div>
  );
}

export default App;
