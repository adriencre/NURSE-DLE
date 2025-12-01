import { pathologies } from '../data/pathologies.js';

/**
 * Récupère la date effective (avec l'offset admin si présent)
 */
function getEffectiveDate() {
  const offset = parseInt(localStorage.getItem('nursdle_date_offset') || '0');
  const today = new Date();
  // Utiliser setTime pour ajouter des jours en millisecondes (plus fiable)
  const effectiveDate = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000);
  return effectiveDate;
}

/**
 * Sélectionne une pathologie de manière déterministe basée sur la date du jour et le mode
 * @param {string} mode - Le mode de jeu ('classic', 'quote', 'image', 'emoji')
 * @returns {Object} La pathologie du jour pour ce mode
 */
export function getPathologyOfTheDay(mode = 'classic') {
  const effectiveDate = getEffectiveDate();
  const dayOfYear = Math.floor((effectiveDate - new Date(effectiveDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Récupère l'offset admin (nombre de jours forcés)
  const adminOffset = parseInt(localStorage.getItem('nursdle_date_offset') || '0');
  
  // Utilise un offset différent pour chaque mode pour avoir des pathologie différentes
  const modeOffsets = {
    'classic': 0,
    'quote': 1000,
    'image': 2000,
    'emoji': 3000
  };
  
  const modeOffset = modeOffsets[mode] || 0;
  
  // Combine dayOfYear, modeOffset et adminOffset pour garantir un changement
  // On multiplie adminOffset par un grand nombre pour éviter les collisions
  const seed = dayOfYear + modeOffset + (adminOffset * 10000);
  
  // Utilise le seed pour sélectionner une pathologie
  const index = seed % pathologies.length;
  return pathologies[index];
}

/**
 * Vérifie si deux chaînes correspondent (exacte, partielle ou aucune)
 * @param {string} guess - La réponse de l'utilisateur
 * @param {string} answer - La réponse correcte
 * @returns {string} 'exact' | 'partial' | 'none'
 */
export function checkMatch(guess, answer) {
  const normalizedGuess = guess.toLowerCase().trim();
  const normalizedAnswer = answer.toLowerCase().trim();
  
  if (normalizedGuess === normalizedAnswer) {
    return 'exact';
  }
  
  // Correspondance partielle : si l'un contient l'autre
  if (normalizedGuess.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedGuess)) {
    return 'partial';
  }
  
  return 'none';
}

