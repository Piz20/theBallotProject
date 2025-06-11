"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Users, Plus, Edit2, Trash2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { useToastStore } from '@/hooks/useToastStore';

// Import your GraphQL queries and mutations
import {
  GET_ELIGIBLE_EMAILS_BY_ELECTION,
  CREATE_ELIGIBLE_EMAIL,
  UPDATE_ELIGIBLE_EMAIL,
  DELETE_ELIGIBLE_EMAIL,
} from "../../../lib/mutations/eligibleEmailMutations";

interface EligibleEmail {
  id: number;
  email: string;
  election: {
    id: number;
    name: string;
  };
}

interface VotersSelectionProps {
  electionId: number;
}

const VotersSelection: React.FC<VotersSelectionProps> = ({ electionId: propElectionId }) => {
  const { addToast, removeToast } = useToastStore();

  const electionId = typeof propElectionId === 'string' ? parseInt(propElectionId, 10) : propElectionId;

  if (isNaN(electionId)) {
    return (
      <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 mr-2" />
        Erreur: ID d'élection invalide fourni.
      </div>
    );
  }

  const [eligibleEmails, setEligibleEmails] = useState<EligibleEmail[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEligibleEmail, setEditingEligibleEmail] = useState<EligibleEmail | null>(null);
  const [formData, setFormData] = useState({
    email: '',
  });

  const [aiQuery, setAiQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<EligibleEmail[]>([]);

  // --- Requête GraphQL pour récupérer les emails éligibles ---
const { loading: queryLoading, error: queryError, data, refetch } = useQuery(GET_ELIGIBLE_EMAILS_BY_ELECTION, {
    variables: { electionId: electionId },
    fetchPolicy: 'cache-and-network', // Pour toujours s'assurer d'avoir les données les plus fraîches du serveur
    onCompleted: (queryData) => {
        if (queryData && queryData.eligibleEmailsByElection) {
            setEligibleEmails(queryData.eligibleEmailsByElection);
        }
    },
    onError: (err) => { /* ... */ }
});


  // Mise à jour de `eligibleEmails` quand les données de la query changent
  useEffect(() => {
    if (data && data.eligibleEmailsByElection) {
      setEligibleEmails(data.eligibleEmailsByElection);
    }
  }, [data]);


  // --- Mutations GraphQL optimisées avec `update` du cache ---
  // ... (code existant)

  const [createEligibleEmailMutation, { loading: createLoading }] = useMutation(CREATE_ELIGIBLE_EMAIL, {
    update(cache, { data }) { // Accédez directement à 'data'
      // Assurez-vous que 'data' existe et contient 'createEligibleEmail' et que 'eligibleEmail' est bien présent
      if (data && data.createEligibleEmail && data.createEligibleEmail.eligibleEmail) {
        const newEligibleEmail = data.createEligibleEmail.eligibleEmail; // C'est l'objet EligibleEmailType que vous voulez !

        const existingEmails = cache.readQuery<{ eligibleEmailsByElection: EligibleEmail[] }>({
          query: GET_ELIGIBLE_EMAILS_BY_ELECTION,
          variables: { electionId: electionId },
        });

        if (existingEmails) {
          cache.writeQuery({
            query: GET_ELIGIBLE_EMAILS_BY_ELECTION,
            variables: { electionId: electionId },
            data: {
              eligibleEmailsByElection: [...existingEmails.eligibleEmailsByElection, newEligibleEmail],
            },
          });
        }
      }
    },
    onCompleted: () => {
      addToast({
        title: 'Succès',
        message: 'Email éligible ajouté avec succès !',
        variant: 'success',
      });
      setShowAddForm(false);
      setFormData({ email: '' });
    },
    onError: (mutationError: ApolloError) => {
      console.error("Erreur lors de l'ajout de l'email éligible:", mutationError);
      addToast({
        title: 'Échec de l\'ajout',
        message: `Échec de l'ajout : ${mutationError.message}`,
        variant: 'error',
      });
    }
  });

  // ... (reste du code)

  const [updateEligibleEmailMutation, { loading: updateLoading }] = useMutation(UPDATE_ELIGIBLE_EMAIL, {
    update(cache, { data: { updateEligibleEmail } }) {
      // Utilisez cache.modify pour mettre à jour l'objet existant dans le cache
      // Cela fonctionne mieux si la mutation retourne l'objet complet mis à jour
      cache.modify({
        id: cache.identify(updateEligibleEmail), // Obtenez l'identifiant de cache de l'objet mis à jour
        fields: {
          // Vous pouvez spécifier les champs à modifier, par exemple, l'email
          email() {
            return updateEligibleEmail.email;
          }
          // Si d'autres champs changent, ajoutez-les ici
        },
      });
    },
    onCompleted: () => {
      // Pas besoin de refetch() ici
      addToast({
        title: 'Succès',
        message: 'Email éligible mis à jour avec succès !',
        variant: 'success',
      });
      setShowAddForm(false);
      setEditingEligibleEmail(null);
      setFormData({ email: '' }); // Réinitialisez le formulaire
    },
    onError: (mutationError: ApolloError) => {
      console.error("Erreur lors de la mise à jour de l'email éligible:", mutationError);
      addToast({
        title: 'Échec de la mise à jour',
        message: `Échec de la mise à jour : ${mutationError.message}`,
        variant: 'error',
      });
    }
  });

  const [deleteEligibleEmailMutation, { loading: deleteLoading }] = useMutation(DELETE_ELIGIBLE_EMAIL, {
    update(cache, { data }) {
        // Assurez-vous que data et data.deleteEligibleEmail existent et contiennent l'ID
        // C'est l'OPTION 2 : la mutation retourne l'objet EligibleEmailType supprimé
        if (data && data.deleteEligibleEmail && data.deleteEligibleEmail.id) {
            const deletedEligibleEmail = data.deleteEligibleEmail;
            const deletedEmailId = deletedEligibleEmail.id;

            // 1. Expulser l'objet supprimé du cache global d'Apollo
            // cache.identify() créera l'ID de cache unique à partir de l'objet fourni.
            const cacheIdToDelete = cache.identify(deletedEligibleEmail);

            if (cacheIdToDelete) {
                cache.evict({ id: cacheIdToDelete });
                cache.gc(); // Exécute le garbage collection pour nettoyer les références orphelines
            }

            // 2. Mettre à jour la liste des emails éligibles pour cette élection
            // On filtre la liste pour retirer la référence à l'objet supprimé.
            cache.modify({
                fields: {
                    // Cette fonction sera appelée pour le champ 'eligibleEmailsByElection'
                    // de toutes les requêtes qui contiennent ce champ dans le cache.
                    eligibleEmailsByElection(existingEmailsRefs = [], { readField }) {
                        // Retourne une nouvelle liste sans l'email qui vient d'être supprimé
                        return existingEmailsRefs.filter(
                            (eligibleEmailRef: any) => readField('id', eligibleEmailRef) !== deletedEmailId
                        );
                    },
                },
            });
        }
    },
    onCompleted: () => {
        addToast({
            title: 'Succès',
            message: 'Email éligible supprimé avec succès !',
            variant: 'success',
        });
    },
    onError: (mutationError: ApolloError) => {
        console.error("Erreur lors de la suppression de l'email éligible:", mutationError);
        addToast({
            title: 'Échec de la suppression',
            message: `Échec de la suppression : ${mutationError.message}`,
            variant: 'error',
        });
    }
});
  // --- Fonctions de gestion du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      addToast({
        title: 'Erreur de validation',
        message: 'Veuillez entrer une adresse e-mail valide.',
        variant: 'error',
      });
      return;
    }

    if (!editingEligibleEmail && eligibleEmails.some(ee => ee.email === formData.email)) {
      addToast({
        title: 'Email existant',
        message: 'Un email éligible avec cette adresse existe déjà dans votre liste.',
        variant: 'error',
      });
      return;
    }
    if (editingEligibleEmail && eligibleEmails.some(ee => ee.email === formData.email && ee.id !== editingEligibleEmail.id)) {
      addToast({
        title: 'Email en doublon',
        message: 'Cet email est déjà utilisé par un autre enregistrement.',
        variant: 'error',
      });
      return;
    }

    try {
      if (editingEligibleEmail) {
        const idToUpdate = parseInt(String(editingEligibleEmail.id), 10);
        if (isNaN(idToUpdate)) {
          addToast({
            title: 'ID invalide',
            message: "L'ID de l'email à modifier est invalide.",
            variant: 'error',
          });
          return;
        }

        await updateEligibleEmailMutation({
          variables: {
            id: idToUpdate,
            email: formData.email,
          },
        });
      } else {
        await createEligibleEmailMutation({
          variables: {
            electionId: electionId,
            email: formData.email,
          },
        });
      }
      setFormData({ email: '' });
    } catch (opError) {
      console.error("Échec inattendu de l'opération de soumission:", opError);
      addToast({
        title: 'Erreur inattendue',
        message: "Une erreur inattendue est survenue. Veuillez réessayer.",
        variant: 'error',
      });
    }
  };

  const handleEdit = (eligibleEmail: EligibleEmail) => {
    setEditingEligibleEmail(eligibleEmail);
    setFormData({
      email: eligibleEmail.email,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    const idToDelete = parseInt(String(id), 10);
    if (isNaN(idToDelete)) {
      addToast({
        title: 'ID invalide',
        message: "L'ID de l'email à supprimer est invalide.",
        variant: 'error',
      });
      return;
    }

    // Ici, nous utilisons window.confirm avant de potentiellement appeler addToast avec duration: 0.
    // C'est parce que votre système de toasts actuel ne prend pas en charge les boutons "Oui/Non" directement.
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet email éligible ? Cette action est irréversible.')) {
      try {
        await deleteEligibleEmailMutation({ variables: { id: idToDelete } });
        // Le toast de succès/erreur sera géré par onCompleted/onError de la mutation
      } catch (opError) {
        console.error("Échec de l'opération de suppression:", opError);
        addToast({
          title: 'Erreur de suppression',
          message: 'Échec de la suppression de l\'email. Veuillez réessayer.',
          variant: 'error',
        });
      }
    }
  };


  const handleCancel = () => {
    setShowAddForm(false);
    setEditingEligibleEmail(null);
    setFormData({ email: '' });
  };

  // --- Logique de recherche AI (toujours simulée) ---
  const debounce = (func: Function, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedAiSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockAiEmails: EligibleEmail[] = [
          { id: 1001, email: 'user.ai.1@example.com', election: { id: electionId, name: 'Current Election' } },
          { id: 1002, email: 'test.ai.2@company.com', election: { id: electionId, name: 'Current Election' } },
          { id: 1003, email: 'candidate.ai.3@domain.org', election: { id: electionId, name: 'Current Election' } },
          { id: 1004, email: 'contact.ai.4@global.net', election: { id: electionId, name: 'Current Election' } },
          { id: 1005, email: 'developer.ai.5@tech.io', election: { id: electionId, name: 'Current Election' } },
        ];

        const filtered = mockAiEmails.filter(ee =>
          ee.email.toLowerCase().includes(query.toLowerCase())
        );

        const newResults = filtered.filter(
          (result) => !eligibleEmails.some((existing) => existing.email === result.email)
        );

        setSearchResults(newResults);
        if (newResults.length === 0 && query.trim() !== '') {
          addToast({
            title: 'Aucun résultat',
            message: 'Aucun email trouvé correspondant à votre recherche.',
            variant: 'default',
          });
        }
      } catch (err) {
        console.error("Erreur lors de la recherche AI simulée:", err);
        addToast({
          title: 'Erreur de recherche',
          message: "Échec de la recherche AI. Veuillez réessayer.",
          variant: 'error',
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [eligibleEmails, electionId]
  );

  const handleAiQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setAiQuery(query);
    debouncedAiSearch(query);
  };

  const addFromSearch = async (emailToAdd: EligibleEmail) => {
    if (eligibleEmails.some(ee => ee.email === emailToAdd.email)) {
      addToast({
        title: 'Déjà présent',
        message: `L'email "${emailToAdd.email}" est déjà dans votre liste.`,
        variant: 'default',
      });
      return;
    }

    try {
      await createEligibleEmailMutation({
        variables: {
          electionId: electionId,
          email: emailToAdd.email,
        },
      });
      // Mettre à jour les searchResults localement après ajout réussi
      setSearchResults(searchResults.filter(v => v.email !== emailToAdd.email));
      setAiQuery(''); // Réinitialiser la recherche
    } catch (opError) {
      console.error("Échec de l'ajout depuis la recherche:", opError);
      addToast({
        title: 'Erreur d\'ajout',
        message: "Échec de l'ajout depuis la recherche AI. Veuillez réessayer.",
        variant: 'error',
      });
    }
  };

  // --- Rendu du composant ---
  const isSubmitting = createLoading || updateLoading || deleteLoading;

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Chargement des emails éligibles...
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-6 h-6 mr-2" />
        Erreur lors du chargement des emails éligibles : {queryError.message}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Emails Éligibles</h2>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingEligibleEmail(null); setFormData({ email: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un email
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-50 border p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {editingEligibleEmail ? 'Modifier l\'email éligible' : 'Ajouter un email éligible'}
          </h3>
          <div>
            <label htmlFor="eligible-email" className="block text-sm font-medium mb-1">Adresse Email *</label>
            <input
              id="eligible-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="votant@example.com"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingEligibleEmail ? 'Mettre à jour' : 'Ajouter'}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Section de recherche AI (simulation front-end) */}
      <div className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Recherche d'emails éligibles par IA (Simulée)</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Utilisez la recherche AI pour trouver et ajouter des emails. (Cette partie est encore une simulation frontend sans appel API réel pour la recherche AI spécifique).
        </p>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Rechercher des emails éligibles..."
            value={aiQuery}
            onChange={handleAiQueryChange}
            onKeyPress={(e) => e.key === 'Enter' && debouncedAiSearch(aiQuery)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={() => debouncedAiSearch(aiQuery)}
            disabled={!aiQuery.trim() || isSearching}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Rechercher
              </>
            )}
          </button>
        </div>

        {/* Résultats de la recherche AI */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Résultats de la recherche AI
            </h4>
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{result.email}</p>
                    <p className="text-xs text-gray-500">Élection: {result.election.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => addFromSearch(result)}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste des emails éligibles actuels */}
      {eligibleEmails.length === 0 && !queryLoading ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun email éligible ajouté pour le moment. Utilisez le bouton "Ajouter un email" ou la recherche AI.</p>
        </div>
      ) : (
        !queryLoading && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Emails Éligibles Actuels ({eligibleEmails.length})
            </h3>
            {eligibleEmails.map((eligibleEmail) => (
              <div key={eligibleEmail.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{eligibleEmail.email}</p>
                  <p className="text-xs text-gray-500">Élection: {eligibleEmail.election.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(eligibleEmail)}
                    className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                    aria-label={`Modifier ${eligibleEmail.email}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(eligibleEmail.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    aria-label={`Supprimer ${eligibleEmail.email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default VotersSelection;