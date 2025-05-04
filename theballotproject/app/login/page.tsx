

'use client';

import React, { useState, FormEvent, ChangeEvent, FocusEvent } from 'react';
import {
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon, // Utilisée pour le titre ET le champ email
} from '@heroicons/react/24/outline';

type Mode = 'login' | 'register';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const AuthFormDark: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  // Optionnel: suivre les champs touchés pour affiner l'affichage des erreurs
  // const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Marquer comme touché (si besoin d'affiner l'UX)
  // const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
  //   const { name } = event.target;
  //   setTouched(prev => ({ ...prev, [name]: true }));
  //   validateField(name, event.target.value); // Valider aussi au blur
  // };

  // Validation pour un champ spécifique
  const validateField = (fieldName: string, value: string): string | undefined => {
    switch (fieldName) {
      case 'name':
        if (mode === 'register' && !value.trim()) return 'Le nom complet est requis.';
        break;
      case 'email':
        if (!value.trim()) return "L'adresse e-mail est requise.";
        // Validation de format simple
        if (!/\S+@\S+\.\S+/.test(value)) return "L'adresse e-mail est invalide.";
        break;
      case 'password':
        if (!value) return 'Le mot de passe est requis.';
        if (value.length < 6) return 'Le mot de passe doit faire au moins 6 caractères.';
        break;
      default: break;
    }
    return undefined; // Aucune erreur
  };

  // Gère les changements dans les inputs et valide à la volée
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'name': setName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
    }
    const fieldError = validateField(name, value);
    // Met à jour l'erreur pour ce champ spécifique
    setErrors(prev => ({ ...prev, [name]: fieldError, general: undefined }));
  };

  // Bascule entre Login et Register
  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setName(''); setEmail(''); setPassword('');
    setErrors({}); setIsLoading(false); // setTouched({});
  };

  // Validation complète avant de soumettre
  const validateFormOnSubmit = (): boolean => {
    const nameError = validateField('name', name);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const newErrors: Errors = {};
    // Inclut l'erreur de nom seulement en mode register
    if (nameError && mode === 'register') newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    // Optionnel: marquer tous les champs comme touchés ici si vous utilisez cette logique
    // setTouched({ name: true, email: true, password: true });
    return Object.keys(newErrors).length === 0; // True si pas d'erreurs
  };

  // Soumission du formulaire
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateFormOnSubmit()) return; // Stop si erreurs

    setIsLoading(true);
    console.log('Soumission (simulation)...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simule l'attente

    try {
      // Logique d'appel API ici...
      alert(`Formulaire ${mode === 'login' ? 'de connexion' : "d'inscription"} soumis (simulation)!`);
      // Gérer succès (ex: redirection)
    } catch (error) {
      console.error("Erreur d'authentification (simulation):", error);
      setErrors({ general: `Erreur serveur. Veuillez réessayer.` });
    } finally {
      setIsLoading(false);
    }
  };

  // Classes CSS pour les inputs (avec gestion d'erreur)
  const getInputClassName = (fieldName: keyof Errors): string => {
    const base = 'w-full pl-10 pr-3 py-2.5 border rounded-md text-gray-100 bg-gray-700 focus:outline-none focus:ring-2 transition-colors duration-200 ease-in-out placeholder-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed';
    const error = 'border-red-500 focus:ring-red-500';
    const normal = 'border-gray-600 focus:border-blue-500 focus:ring-blue-500';
    // Affiche l'erreur si elle existe (simplifié, sans 'touched')
    const showError = !!errors[fieldName];
    return `${base} ${showError ? error : normal}`;
  };

  // --- Rendu JSX ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200 p-4 font-sans">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        {/* En-tête et titre */}
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            {/* L'icône d'enveloppe avec la classe d'animation */}
            <EnvelopeIcon className="animate-heartbeat mx-auto h-12 w-12 text-blue-500 mb-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {mode === 'login' ? 'Accès Portail Électeur' : 'Inscrivez-vous pour Participer'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {mode === 'login' ? 'Connectez-vous à votre compte.' : 'Créez un compte rapidement.'}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Champ Nom (mode Register) */}
            {mode === 'register' && (
              <div className="space-y-1"> {/* Conteneur Input + Erreur */}
                <div className="relative">
                  <label htmlFor="name" className="sr-only">Nom Complet</label>
                  <UserIcon className="input-icon" /> {/* Classe pour icônes */}
                  <input
                    type="text" id="name" name="name" value={name}
                    onChange={handleChange}
                    // onBlur={handleBlur} // Décommentez si vous utilisez 'touched'
                    className={getInputClassName('name')}
                    placeholder="Votre Nom Complet" aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    disabled={isLoading}
                  />
                </div>
                {/* Espace réservé pour message d'erreur */}
                <div className="error-message-container">
                  {errors.name && <p id="name-error" className="error-message">{errors.name}</p>}
                </div>
              </div>
            )}

            {/* Champ Email */}
            <div className="space-y-1">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Adresse E-mail</label>
                <EnvelopeIcon className="input-icon" />
                <input
                  type="email" id="email" name="email" autoComplete="email" value={email}
                  onChange={handleChange}
                  // onBlur={handleBlur}
                  className={getInputClassName('email')}
                  placeholder="adresse@exemple.com" aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              <div className="error-message-container">
                {errors.email && <p id="email-error" className="error-message">{errors.email}</p>}
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="space-y-1">
              <div className="relative">
                <label htmlFor="password" className="sr-only">Mot de passe</label>
                <LockClosedIcon className="input-icon" />
                <input
                  type="password" id="password" name="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={handleChange}
                  // onBlur={handleBlur}
                  className={getInputClassName('password')}
                  placeholder="Votre mot de passe" aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={isLoading}
                />
              </div>
              <div className="error-message-container">
                {errors.password && <p id="password-error" className="error-message">{errors.password}</p>}
              </div>
            </div>

            {/* Lien Mot de passe oublié */}
            {mode === 'login' && (
              <div className="text-right text-sm pt-1">
                <a href="#" className={`link ${isLoading ? 'link-disabled' : ''}`} onClick={(e) => { if(isLoading) e.preventDefault(); }}>
                  Mot de passe oublié ?
                </a>
              </div>
            )}

            {/* Erreur Générale */}
            {errors.general && (
              <div role="alert" className="general-error-container">
                <p className="text-sm text-red-300">{errors.general}</p>
              </div>
            )}

            {/* Bouton Soumettre */}
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className={`submit-button ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] hover:shadow-md hover:shadow-blue-500/30'}`}>
                {isLoading ? (
                  <> {/* Spinner */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg> Chargement...
                  </>
                ) : mode === 'login' ? 'Se Connecter' : 'Créer mon Compte'}
              </button>
            </div>
          </form>
        </div>

        {/* Pied de page pour changer de mode */}
        <div className="footer-toggle">
          <p className="text-sm text-gray-400">
            {mode === 'login' ? 'Pas encore inscrit ?' : 'Vous avez déjà un compte ?'}
            <button type="button" onClick={toggleMode} disabled={isLoading} className={`link ml-1 ${isLoading ? 'link-disabled' : ''}`}>
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>

      {/* Footer page */}
      <footer className="page-footer">
        © {new Date().getFullYear()} The Ballot Project (Exemple). Tous droits réservés.
      </footer>

      {/* Ajout de styles de base pour simplifier la lecture du TSX */}
      {/* Ces styles peuvent être mis dans globals.css si vous préférez */}
      <style jsx global>{`
        .input-icon {
           position: absolute;
           left: 0.75rem; /* left-3 */
           top: 50%;
           transform: translateY(-50%);
           height: 1.25rem; /* h-5 */
           width: 1.25rem; /* w-5 */
           color: #6b7280; /* text-gray-500 */
           pointer-events: none;
        }
        .error-message-container {
            min-height: 18px; /* Réserve l'espace */
        }
        .error-message {
            font-size: 0.75rem; /* text-xs */
            line-height: 1rem;
            color: #fca5a5; /* text-red-400 */
            padding-left: 0.25rem; /* pl-1 */
        }
        .link {
            font-weight: 500; /* font-medium */
            color: #60a5fa; /* text-blue-400 */
            transition-property: color, text-decoration-color;
            transition-duration: 150ms;
            transition-timing-function: ease-in-out;
        }
        .link:hover {
            color: #93c5fd; /* hover:text-blue-300 */
            text-decoration-line: underline;
        }
        .link-disabled {
            opacity: 0.5;
            pointer-events: none;
        }
        .general-error-container {
            padding: 0.75rem; /* p-3 */
            background-color: rgba(127, 29, 29, 0.5); /* bg-red-900 approx */
            border: 1px solid #7f1d1d; /* border-red-700 */
            border-radius: 0.375rem; /* rounded-md */
            text-align: center;
            transition-property: opacity;
            transition-duration: 300ms;
        }
        .submit-button {
             width: 100%; display: flex; justify-content: center; align-items: center;
             background-color: #2563eb; /* bg-blue-600 */
             color: white; font-weight: 600; /* font-semibold */
             padding-top: 0.625rem; padding-bottom: 0.625rem; /* py-2.5 */
             padding-left: 1rem; padding-right: 1rem; /* px-4 */
             border-radius: 0.375rem; /* rounded-md */
             box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); /* shadow-sm */
             transition-property: all; transition-duration: 300ms; transition-timing-function: ease-in-out;
        }
        .submit-button:hover:not(:disabled) {
             background-color: #1d4ed8; /* hover:bg-blue-700 */
             transform: scale(1.02);
             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.3); /* hover:shadow-md hover:shadow-blue-500/30 approx */
        }
        .submit-button:focus {
            outline: none;
            box-shadow: 0 0 0 2px #374151, 0 0 0 4px #60a5fa; /* focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 approx */
        }
        .footer-toggle {
            background-color: #111827; /* bg-gray-900 */
            padding: 1rem 2rem; /* px-8 py-4 */
            border-top: 1px solid #374151; /* border-t border-gray-700 */
            text-align: center;
        }
        .page-footer {
            margin-top: 2rem; /* mt-8 */
            text-align: center;
            font-size: 0.875rem; /* text-sm */
            line-height: 1.25rem;
            color: #6b7280; /* text-gray-500 */
        }
      `}</style>
    </div>
  );
};

export default AuthFormDark;