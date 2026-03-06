import { supabase } from './supabaseClient';

/**
 * Génère la date du jour en format YYYY-MM-DD (heure locale, pas UTC)
 */
function getLocalToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Enregistre le résultat d'une partie en BDD
 */
export async function saveGameResult({ userId, mode, pathologyId, attempts, won, timeTaken = null }) {
  const today = getLocalToday();

  const { data, error } = await supabase
    .from('game_results')
    .upsert({
      user_id: userId,
      mode,
      pathology_id: pathologyId,
      attempts,
      won,
      time_taken: timeTaken,
      played_at: today,
    }, {
      onConflict: 'user_id,mode,played_at'
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur sauvegarde résultat:', error);
  } else {
    console.log('Résultat sauvegardé:', data);
  }

  // Mettre à jour les stats du profil
  if (!error && userId) {
    await updatePlayerStats(userId);
  }

  return { data, error };
}

/**
 * Met à jour les statistiques globales du joueur
 */
async function updatePlayerStats(userId) {
  // Récupérer tous les résultats du joueur
  const { data: results } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', userId);

  if (!results) return;

  const totalGames = results.length;
  const totalWins = results.filter(r => r.won).length;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Calculer le streak actuel
  const streak = calculateStreak(results);

  // Récupérer le meilleur streak existant
  const { data: profile } = await supabase
    .from('profiles')
    .select('best_streak')
    .eq('id', userId)
    .single();

  const bestStreak = Math.max(profile?.best_streak || 0, streak);

  await supabase
    .from('profiles')
    .update({
      total_games: totalGames,
      total_wins: totalWins,
      win_rate: winRate,
      current_streak: streak,
      best_streak: bestStreak,
    })
    .eq('id', userId);
}

/**
 * Calcule le streak actuel (jours consécutifs avec au moins une victoire)
 */
function calculateStreak(results) {
  const wonDays = [...new Set(
    results
      .filter(r => r.won)
      .map(r => r.played_at)
  )].sort().reverse();

  if (wonDays.length === 0) return 0;

  let streak = 1;
  const today = getLocalToday();

  // Si le dernier jour gagné n'est ni aujourd'hui ni hier, streak = 0
  const lastWonDate = new Date(wonDays[0]);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate - lastWonDate) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0;

  for (let i = 1; i < wonDays.length; i++) {
    const current = new Date(wonDays[i - 1]);
    const prev = new Date(wonDays[i]);
    const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Récupère le classement quotidien pour un mode donné
 */
export async function getDailyLeaderboard(mode, limit = 50) {
  const today = getLocalToday();

  console.log('Classement quotidien - mode:', mode, 'date:', today);

  // Récupérer les résultats du jour
  const { data: results, error: resultsError } = await supabase
    .from('game_results')
    .select('user_id, attempts, won, time_taken, played_at')
    .eq('mode', mode)
    .eq('played_at', today)
    .eq('won', true)
    .order('attempts', { ascending: true })
    .limit(limit);

  if (resultsError) {
    console.error('Erreur classement quotidien:', resultsError);
    return [];
  }

  if (!results || results.length === 0) {
    console.log('Aucun résultat trouvé pour', mode, today);
    return [];
  }

  // Récupérer les profils des joueurs
  const userIds = [...new Set(results.map(r => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  const profileMap = {};
  (profiles || []).forEach(p => { profileMap[p.id] = p; });

  // Fusionner résultats + profils
  const leaderboard = results.map(r => ({
    ...r,
    profiles: profileMap[r.user_id] || { username: 'Anonyme', avatar_url: null },
  }));

  console.log('Classement:', leaderboard.length, 'entrées');
  return leaderboard;
}

/**
 * Récupère le classement global (tous modes confondus)
 */
export async function getGlobalLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, total_games, total_wins, win_rate, current_streak, best_streak')
    .gt('total_games', 0)
    .order('total_wins', { ascending: false })
    .order('win_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur classement global:', error);
    return [];
  }

  return data || [];
}

/**
 * Récupère les stats d'un joueur
 */
export async function getPlayerStats(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, total_games, total_wins, win_rate, current_streak, best_streak')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erreur stats joueur:', error);
    return null;
  }
  return data;
}

/**
 * Récupère l'historique des parties d'un joueur
 */
export async function getPlayerHistory(userId, limit = 30) {
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur historique:', error);
    return [];
  }
  return data || [];
}




