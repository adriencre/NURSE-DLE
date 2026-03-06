import { supabase } from './supabaseClient';
import { pathologies } from '../data/pathologies';

/**
 * Génère un ID de pathologie aléatoire
 */
function getRandomPathologyId() {
  const index = Math.floor(Math.random() * pathologies.length);
  return pathologies[index].id;
}

/**
 * Crée un nouveau salon de duel
 */
export async function createRoom(userId, username, maxPlayers = 2, winsNeeded = 5) {
  // Créer la room
  const { data: room, error: roomError } = await supabase
    .from('duel_rooms')
    .insert({
      host_id: userId,
      max_players: maxPlayers,
      wins_needed: winsNeeded,
    })
    .select()
    .single();

  if (roomError) {
    console.error('Erreur création room:', roomError);
    return { room: null, error: roomError };
  }

  // Ajouter l'hôte comme joueur
  const { error: playerError } = await supabase
    .from('duel_players')
    .insert({
      room_id: room.id,
      user_id: userId,
      username: username,
    });

  if (playerError) {
    console.error('Erreur ajout hôte:', playerError);
  }

  return { room, error: null };
}

/**
 * Rejoindre un salon existant
 */
export async function joinRoom(roomId, userId, username) {
  // Vérifier que la room existe et est en attente
  const { data: room, error: roomError } = await supabase
    .from('duel_rooms')
    .select('*, duel_players(count)')
    .eq('id', roomId.toUpperCase())
    .single();

  if (roomError || !room) {
    return { error: { message: 'Salon introuvable' } };
  }

  if (room.status !== 'waiting') {
    return { error: { message: 'La partie a déjà commencé' } };
  }

  // Compter les joueurs actuels
  const { count } = await supabase
    .from('duel_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if (count >= room.max_players) {
    return { error: { message: 'Le salon est plein' } };
  }

  // Rejoindre
  const { error: joinError } = await supabase
    .from('duel_players')
    .insert({
      room_id: room.id,
      user_id: userId,
      username: username,
    });

  if (joinError) {
    if (joinError.code === '23505') {
      return { error: { message: 'Vous êtes déjà dans ce salon' } };
    }
    return { error: joinError };
  }

  return { room, error: null };
}

/**
 * Quitter un salon
 */
export async function leaveRoom(roomId, userId) {
  await supabase
    .from('duel_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
}

/**
 * Récupérer les infos d'un salon
 */
export async function getRoom(roomId) {
  const { data, error } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Récupérer les joueurs d'un salon
 */
export async function getPlayers(roomId) {
  const { data, error } = await supabase
    .from('duel_players')
    .select('*')
    .eq('room_id', roomId)
    .order('score', { ascending: false });

  if (error) return [];
  return data || [];
}

/**
 * Lancer une nouvelle manche (hôte uniquement)
 */
export async function startRound(roomId) {
  const pathologyId = getRandomPathologyId();

  // Reset has_found pour tous les joueurs
  await supabase
    .from('duel_players')
    .update({ has_found: false })
    .eq('room_id', roomId);

  // Mettre à jour la room avec la nouvelle pathologie
  const { error } = await supabase
    .from('duel_rooms')
    .update({
      current_pathology_id: pathologyId,
      round_winner_id: null,
      round_active: true,
      current_round: undefined, // sera incrémenté ci-dessous
    })
    .eq('id', roomId);

  if (error) {
    console.error('Erreur démarrage manche:', error);
    return;
  }

  // Incrémenter le numéro de manche
  const { data: room } = await supabase
    .from('duel_rooms')
    .select('current_round')
    .eq('id', roomId)
    .single();

  await supabase
    .from('duel_rooms')
    .update({ current_round: (room?.current_round || 0) + 1 })
    .eq('id', roomId);
}

/**
 * Lancer la partie (hôte uniquement)
 */
export async function startGame(roomId) {
  await supabase
    .from('duel_rooms')
    .update({ status: 'playing', current_round: 0 })
    .eq('id', roomId);

  // Lancer la première manche après un court délai
  setTimeout(() => startRound(roomId), 500);
}

/**
 * Un joueur a trouvé la réponse
 */
export async function playerFoundAnswer(roomId, userId, pathologyId) {
  // Vérifier que la manche est toujours active et que c'est la bonne pathologie
  const { data: room } = await supabase
    .from('duel_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (!room || !room.round_active || room.current_pathology_id !== pathologyId) {
    return { success: false };
  }

  // Si personne n'a encore trouvé, ce joueur gagne la manche
  if (!room.round_winner_id) {
    // Marquer le joueur comme gagnant de la manche
    await supabase
      .from('duel_rooms')
      .update({
        round_winner_id: userId,
        round_active: false,
      })
      .eq('id', roomId)
      .is('round_winner_id', null); // condition pour éviter les race conditions

    // Incrémenter le score du joueur
    const { data: player } = await supabase
      .from('duel_players')
      .select('score')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    const newScore = (player?.score || 0) + 1;

    await supabase
      .from('duel_players')
      .update({ score: newScore, has_found: true })
      .eq('room_id', roomId)
      .eq('user_id', userId);

    // Vérifier si la partie est terminée
    if (newScore >= room.wins_needed) {
      await supabase
        .from('duel_rooms')
        .update({ status: 'finished' })
        .eq('id', roomId);
    }

    return { success: true, isWinner: true, newScore };
  }

  // Le joueur a trouvé mais n'est pas le premier
  await supabase
    .from('duel_players')
    .update({ has_found: true })
    .eq('room_id', roomId)
    .eq('user_id', userId);

  return { success: true, isWinner: false };
}

/**
 * S'abonner aux changements d'un salon (Realtime)
 */
export function subscribeToRoom(roomId, onRoomChange, onPlayersChange) {
  const channel = supabase.channel(`room-${roomId}`);

  channel
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'duel_rooms', filter: `id=eq.${roomId}` },
      (payload) => {
        onRoomChange(payload.new);
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'duel_players', filter: `room_id=eq.${roomId}` },
      () => {
        // Recharger tous les joueurs à chaque changement
        getPlayers(roomId).then(onPlayersChange);
      }
    )
    .subscribe();

  return channel;
}

/**
 * Se désabonner d'un salon
 */
export function unsubscribeFromRoom(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

