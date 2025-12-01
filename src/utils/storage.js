// Génère une clé basée sur la date du jour
function getTodayKey(mode) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  return `nursdle_${mode}_${dateStr}`;
}

// Sauvegarde l'état du jeu pour aujourd'hui
export function saveGameState(mode, state) {
  const key = getTodayKey(mode);
  localStorage.setItem(key, JSON.stringify(state));
}

// Récupère l'état du jeu pour aujourd'hui
export function getGameState(mode) {
  const key = getTodayKey(mode);
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

// Vérifie si le joueur a déjà joué aujourd'hui
export function hasPlayedToday(mode) {
  const state = getGameState(mode);
  return state !== null && state.isWon !== undefined;
}

// Nettoie les anciennes données (plus vieilles qu'une semaine)
export function cleanOldData() {
  const keys = Object.keys(localStorage);
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  keys.forEach(key => {
    if (key.startsWith('nursdle_')) {
      const parts = key.split('_');
      if (parts.length >= 3) {
        const dateStr = parts.slice(2).join('_');
        const dateParts = dateStr.split('-');
        if (dateParts.length === 3) {
          const savedDate = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2])
          );
          if (savedDate < weekAgo) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  });
}

