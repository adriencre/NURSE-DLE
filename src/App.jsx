import { useState } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import ClassicMode from './components/ClassicMode';
import QuoteMode from './components/QuoteMode';
import ComingSoon from './components/ComingSoon';
import EmojiMode from './components/EmojiMode';
import './App.css';

function App() {
  const [currentMode, setCurrentMode] = useState(null);

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);
  };

  const handleBackToMenu = () => {
    setCurrentMode(null);
  };

  const renderMode = () => {
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
        showBack={currentMode !== null} 
        onBack={handleBackToMenu}
      />
      <main className="main-content">
        {renderMode()}
      </main>
    </div>
  );
}

export default App;
