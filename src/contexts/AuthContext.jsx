import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  // Charger le profil utilisateur depuis la table profiles
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        return data;
      }
    } catch {
      // silently fail
    }
    return null;
  }, []);

  // Créer un profil si inexistant
  const ensureProfile = useCallback(async (authUser) => {
    const existing = await fetchProfile(authUser.id);
    if (!existing) {
      const username = authUser.user_metadata?.username ||
                       authUser.email?.split('@')[0] ||
                       `Joueur_${authUser.id.slice(0, 6)}`;
      try {
        const { data } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            username: username,
            avatar_url: authUser.user_metadata?.avatar_url || null,
          })
          .select()
          .single();
        if (data) setProfile(data);
      } catch {
        // silently fail
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Éviter la double initialisation (StrictMode)
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;
    let previousUserId = null;

    // Session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      previousUserId = currentUser?.id ?? null;
      setUser(currentUser);
      if (currentUser) {
        ensureProfile(currentUser).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'auth (seulement SIGNED_IN / SIGNED_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        // Ignorer INITIAL_SESSION — déjà géré par getSession()
        if (event === 'INITIAL_SESSION') return;

        const currentUser = session?.user ?? null;
        const currentUserId = currentUser?.id ?? null;

        // Si l'utilisateur a changé (connexion différente ou déconnexion), nettoyer le localStorage
        if (currentUserId !== previousUserId) {
          console.log('Changement d\'utilisateur détecté — nettoyage du localStorage');
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            // Supprimer toutes les données de jeu (sauf offset admin)
            if (key.startsWith('nursdle_') && key !== 'nursdle_date_offset') {
              localStorage.removeItem(key);
            }
          });
          previousUserId = currentUserId;
        }

        setUser(currentUser);
        if (currentUser) {
          ensureProfile(currentUser);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  // Inscription par email
  const signUp = useCallback(async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    return { data, error };
  }, []);

  // Connexion par email
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // Déconnexion
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  }, []);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: { message: 'Non connecté' } };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  }, [user]);

  // Mémoiser le value pour éviter les re-renders inutiles
  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
  }), [user, profile, loading, signUp, signIn, signOut, updateProfile, fetchProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}



