import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import './AuthModal.css';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="auth-google-icon">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#4285F4" d="M21 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1.3 2.5-2.7 3.1v2.6h3.5c2-1.8 2.8-4.5 2.8-8z" />
      <path fill="#FBBC05" d="M6.1 14.7c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9V8.3H2.7C2.2 9.4 2 10.6 2 11.8s.2 2.4.7 3.5l3.4-2.6z" />
      <path fill="#34A853" d="M12 21c2.6 0 4.8-.9 6.4-2.4l-3.5-2.6c-.9.6-1.9.9-2.9.9-2.2 0-4.1-1.5-4.8-3.5l-3.4 2.6C5.3 18.9 8.4 21 12 21z" />
    </svg>
  );
}

function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(getErrorMessage(error.message));
        } else {
          onClose();
        }
      } else {
        if (!username.trim()) {
          setError('Le pseudo est requis');
          setIsLoading(false);
          return;
        }
        if (username.trim().length < 3) {
          setError('Le pseudo doit faire au moins 3 caractères');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Le mot de passe doit faire au moins 6 caractères');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username.trim());
        if (error) {
          setError(getErrorMessage(error.message));
        } else {
          setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        }
      }
    } catch {
      setError('Une erreur inattendue est survenue');
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(getErrorMessage(error.message));
      }
    } catch {
      setError('Une erreur inattendue est survenue');
    }

    setIsLoading(false);
  };

  const getErrorMessage = (msg) => {
    if (msg.includes('Invalid login')) return 'Email ou mot de passe incorrect';
    if (msg.includes('already registered')) return 'Cet email est déjà utilisé';
    if (msg.includes('invalid email')) return 'Email invalide';
    if (msg.includes('weak password')) return 'Mot de passe trop faible (min. 6 caractères)';
    if (msg.includes('provider is not enabled')) return 'Connexion Google non activée côté serveur';
    return msg;
  };

  return (
    <motion.div
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="auth-modal"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
          >
            <LogIn size={18} />
            Connexion
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
          >
            <UserPlus size={18} />
            Inscription
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                className="auth-field"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="auth-label">
                  <User size={16} />
                  Pseudo
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre pseudo"
                  className="auth-input"
                  maxLength={20}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label className="auth-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="auth-input"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <Lock size={16} />
              Mot de passe
            </label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="auth-input"
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="auth-success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✅ {success}
            </motion.div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-spinner" />
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                Se connecter
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Créer un compte
              </>
            )}
          </button>

          <div className="auth-divider">ou</div>

          <button
            type="button"
            className="auth-google-button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleLogo />
            Continuer avec Google
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default AuthModal;

