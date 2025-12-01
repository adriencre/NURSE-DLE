// Récupère la date effective (avec l'offset admin si présent)
function getEffectiveDate() {
  const offset = parseInt(localStorage.getItem('nursdle_date_offset') || '0');
  const today = new Date();
  // Utiliser setTime pour ajouter des jours en millisecondes (plus fiable)
  const effectiveDate = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
  return effectiveDate;
}

// Génère une clé basée sur la date du jour (utilise la date effective pour l'admin)
function getTodayKey(mode) {
  const effectiveDate = getEffectiveDate();
  const dateStr = `${effectiveDate.getFullYear()}-${effectiveDate.getMonth() + 1}-${effectiveDate.getDate()}`;
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

// Réinitialise toutes les données de jeu (pour l'admin)
// Ne supprime PAS nursdle_date_offset car c'est nécessaire pour forcer un nouveau jour
export function resetAllGameData() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('nursdle_') && key !== 'nursdle_date_offset') {
      localStorage.removeItem(key);
    }
  });
}

// Force un nouveau jour en décalant la date de référence
export function forceNewDay() {
  // On stocke un offset de date dans localStorage
  // Cela permet de "tricher" sur la date du jour pour le calcul de la pathologie
  const currentOffset = parseInt(localStorage.getItem('nursdle_date_offset') || '0');
  const newOffset = currentOffset + 1;
  localStorage.setItem('nursdle_date_offset', newOffset.toString());
  
  // On supprime aussi toutes les données de jeu actuelles pour forcer un nouveau jour
  // (mais on garde nursdle_date_offset)
  resetAllGameData();
  
  console.log(`Nouveau jour forcé ! Offset passé de ${currentOffset} à ${newOffset}`);
}

// Récupère l'offset de date actuel
export function getDateOffset() {
  return parseInt(localStorage.getItem('nursdle_date_offset') || '0');
}

