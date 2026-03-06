import { useState, useEffect, useCallback } from 'react';

import { motion } from 'framer-motion';
import { Trophy, Medal, Calendar, Globe, Crown, Flame, Target, RefreshCw } from 'lucide-react';
import { getDailyLeaderboard, getGlobalLeaderboard } from '../utils/supabaseService';
import { useAuth } from '../contexts/useAuth';
import AdSense from './AdSense';
import './Leaderboard.css';

function Leaderboard() {
  const [tab, setTab] = useState('daily'); // 'daily' | 'global'
  const [mode, setMode] = useState('classic');
  const [dailyData, setDailyData] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  // Wrap loadData in useCallback to use it in dependencies
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'daily') {
        const data = await getDailyLeaderboard(mode);
        setDailyData(data);
      } else {
        const data = await getGlobalLeaderboard();
        setGlobalData(data);
      }
    } catch (err) {
      console.error('Erreur chargement classement:', err);
    }
    setLoading(false);
  }, [tab, mode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown size={20} className="medal-gold" />;
    if (index === 1) return <Medal size={20} className="medal-silver" />;
    if (index === 2) return <Medal size={20} className="medal-bronze" />;
    return <span className="rank-number">{index + 1}</span>;
  };

  const modes = [
    { id: 'classic', label: '🩺 Classique' },
    { id: 'quote', label: '💬 Citation' },
    { id: 'emoji', label: '😄 Emoji' },
  ];

  return (
    <div className="leaderboard">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <Trophy size={28} className="leaderboard-icon" />
          <h2>Classement</h2>
          <button className="lb-refresh" onClick={loadData} title="Rafraîchir">
            <RefreshCw size={18} className={loading ? 'lb-refresh-spin' : ''} />
          </button>
        </div>

        {/* Tabs Daily / Global */}
        <div className="leaderboard-tabs">
          <button
            className={`lb-tab ${tab === 'daily' ? 'active' : ''}`}
            onClick={() => setTab('daily')}
          >
            <Calendar size={16} />
            Aujourd'hui
          </button>
          <button
            className={`lb-tab ${tab === 'global' ? 'active' : ''}`}
            onClick={() => setTab('global')}
          >
            <Globe size={16} />
            Global
          </button>
        </div>

        {/* Sélecteur de mode (daily seulement) */}
        {tab === 'daily' && (
          <div className="leaderboard-modes">
            {modes.map(m => (
              <button
                key={m.id}
                className={`lb-mode ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Contenu */}
        <div className="leaderboard-content">
          {loading ? (
            <div className="lb-loading">
              <div className="lb-spinner" />
              <p>Chargement...</p>
            </div>
          ) : tab === 'daily' ? (
            dailyData.length === 0 ? (
              <div className="lb-empty">
                <Target size={40} />
                <p>Aucun résultat aujourd'hui pour ce mode</p>
                <p className="lb-empty-sub">Soyez le premier à jouer !</p>
              </div>
            ) : (
              <div className="lb-list">
                {dailyData.map((entry, index) => (
                  <motion.div
                    key={index}
                    className={`lb-row ${entry.profiles?.username === profile?.username ? 'lb-row-me' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="lb-rank">
                      {getMedalIcon(index)}
                    </div>
                    <div className="lb-user">
                      <span className="lb-username">{entry.profiles?.username || 'Anonyme'}</span>
                    </div>
                    <div className="lb-stats">
                      <span className="lb-attempts">{entry.attempts} essai{entry.attempts > 1 ? 's' : ''}</span>
                      {entry.time_taken && (
                        <span className="lb-time">{Math.round(entry.time_taken)}s</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            globalData.length === 0 ? (
              <div className="lb-empty">
                <Globe size={40} />
                <p>Aucun joueur pour le moment</p>
              </div>
            ) : (
              <div className="lb-list">
                {globalData.map((entry, index) => (
                  <motion.div
                    key={index}
                    className={`lb-row ${entry.username === profile?.username ? 'lb-row-me' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="lb-rank">
                      {getMedalIcon(index)}
                    </div>
                    <div className="lb-user">
                      <span className="lb-username">{entry.username}</span>
                      <div className="lb-user-stats">
                        <span className="lb-win-rate">{entry.win_rate}%</span>
                        {entry.current_streak > 0 && (
                          <span className="lb-streak">
                            <Flame size={14} />
                            {entry.current_streak}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="lb-stats">
                      <span className="lb-wins">{entry.total_wins} ✓</span>
                      <span className="lb-games">{entry.total_games} parties</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Publicité */}
        <AdSense format="horizontal" slot="1234567890" />
      </div>
    </div>
  );
}

export default Leaderboard;
