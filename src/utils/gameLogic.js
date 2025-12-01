import { pathologies } from '../data/pathologies.js';

/**
 * Sélectionne une pathologie de manière déterministe basée sur la date du jour et le mode
 * @param {string} mode - Le mode de jeu ('classic', 'quote', 'image', 'emoji')
 * @returns {Object} La pathologie du jour pour ce mode
 */
export function getPathologyOfTheDay(mode = 'classic') {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Utilise un offset différent pour chaque mode pour avoir des pathologie différentes
  const modeOffsets = {
    'classic': 0,
    'quote': 1000,
    'image': 2000,
    'emoji': 3000
  };
  
  const offset = modeOffsets[mode] || 0;
  const seed = dayOfYear + offset;
  
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

