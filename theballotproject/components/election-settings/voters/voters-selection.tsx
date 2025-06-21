"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Search, Users, Plus, Edit2, Trash2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useLazyQuery, ApolloError } from '@apollo/client';
import { useToastStore } from '@/hooks/useToastStore';
import { EligibleEmail, Election, User } from '../../../interfaces/interfaces';

 import {toCamelCase} from '../../../lib/utils' ;
// Import your GraphQL queries and mutations
import {
  GET_ELIGIBLE_EMAILS_BY_ELECTION,
  CREATE_ELIGIBLE_EMAIL,
  UPDATE_ELIGIBLE_EMAIL,
  DELETE_ELIGIBLE_EMAIL,
} from "../../../lib/mutations/eligibleEmailMutations";
import { VOTER_SEARCH_QUERY } from "../../../lib/mutations/queryGeneratorMutations";


interface VoterSearchResult {
  sql_query: string;
  error?: string;
  prompt_used?: string;
  data: User[];
}

interface VoterSearchData {
  voterSearch: VoterSearchResult; // objet, pas string
}

interface VoterSearchVars {
  prompt: string;
}

interface VotersSelectionProps {
  electionId: number;
}

const VotersSelection: React.FC<VotersSelectionProps> = ({ electionId: propElectionId }) => {
  const { addToast } = useToastStore();

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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // --- Requête GraphQL pour récupérer les emails éligibles ---
  const { loading: queryLoading, error: queryError, data } = useQuery(GET_ELIGIBLE_EMAILS_BY_ELECTION, {
    variables: { electionId: electionId },
    fetchPolicy: 'cache-and-network',
    onCompleted: (queryData) => {
      if (queryData && queryData.eligibleEmailsByElection) {
        setEligibleEmails(queryData.eligibleEmailsByElection);
      }
    },
    onError: (err) => {
      console.error("Erreur lors du chargement des emails éligibles:", err);
    }
  });


  const [executeVoterSearch, { loading: searchLoading, error: searchError }] = useLazyQuery<
    VoterSearchData,
    VoterSearchVars
  >(VOTER_SEARCH_QUERY, {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data?.voterSearch) {
        const result: VoterSearchResult = data.voterSearch;
        if (result.error) {
          addToast({
            title: 'Erreur de recherche',
            message: result.error,
            variant: 'error',
          });
          setSearchResults([]);
          return;
        }

        // Ne plus filtrer, garder tous les users retournés
        const enrichedResults = result.data.map(user => ({
          ...user,
          alreadyEligible: eligibleEmails.some(e => e.email === user.email),
        }));

        setSearchResults(enrichedResults);

        if (enrichedResults.length === 0 && searchQuery.trim() !== '') {
          addToast({
            title: 'Aucun résultat',
            message: "Aucun utilisateur trouvé correspondant à votre recherche.",
            variant: 'default',
          });
        }
      }
    }
    ,
    onError: (err) => {
      console.error("Erreur lors de la recherche:", err);
      addToast({
        title: 'Erreur de recherche',
        message: "Échec de la recherche d'utilisateurs. Veuillez réessayer.",
        variant: 'error',
      });
      setSearchResults([]);
    },
  });


  // Mise à jour de `eligibleEmails` quand les données de la query changent
  useEffect(() => {
    if (data && data.eligibleEmailsByElection) {
      setEligibleEmails(data.eligibleEmailsByElection);
    }
  }, [data]);

  // --- Mutations GraphQL optimisées avec `update` du cache ---
  const [createEligibleEmailMutation, { loading: createLoading }] = useMutation(CREATE_ELIGIBLE_EMAIL, {
    update(cache, { data }) {
      if (data && data.createEligibleEmail && data.createEligibleEmail.eligibleEmail) {
        const newEligibleEmail = data.createEligibleEmail.eligibleEmail;

        try {
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
        } catch (cacheError) {
          console.warn("Erreur de mise à jour du cache:", cacheError);
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

  const [updateEligibleEmailMutation, { loading: updateLoading }] = useMutation(UPDATE_ELIGIBLE_EMAIL, {
    update(cache, { data }) {
      if (data && data.updateEligibleEmail && data.updateEligibleEmail.eligibleEmail) {
        const updatedEligibleEmail = data.updateEligibleEmail.eligibleEmail;

        try {
          cache.modify({
            id: cache.identify(updatedEligibleEmail),
            fields: {
              email() {
                return updatedEligibleEmail.email;
              }
            },
          });
        } catch (cacheError) {
          console.warn("Erreur de mise à jour du cache:", cacheError);
        }
      }
    },
    onCompleted: () => {
      addToast({
        title: 'Succès',
        message: 'Email éligible mis à jour avec succès !',
        variant: 'success',
      });
      setShowAddForm(false);
      setEditingEligibleEmail(null);
      setFormData({ email: '' });
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
      if (data && data.deleteEligibleEmail && data.deleteEligibleEmail.success) {
        try {
          const existingEmails = cache.readQuery<{ eligibleEmailsByElection: EligibleEmail[] }>({
            query: GET_ELIGIBLE_EMAILS_BY_ELECTION,
            variables: { electionId: electionId },
          });

          if (existingEmails) {
            // Filtrer l'email supprimé de la liste
            const updatedEmails = existingEmails.eligibleEmailsByElection.filter(
              email => email.id !== parseInt(String(data.deleteEligibleEmail.id || 0))
            );

            cache.writeQuery({
              query: GET_ELIGIBLE_EMAILS_BY_ELECTION,
              variables: { electionId: electionId },
              data: {
                eligibleEmailsByElection: updatedEmails,
              },
            });
          }
        } catch (cacheError) {
          console.warn("Erreur de mise à jour du cache:", cacheError);
        }
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
      email: eligibleEmail.email ?? '',
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

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet email éligible ? Cette action est irréversible.')) {
      try {
        await deleteEligibleEmailMutation({ variables: { id: idToDelete } });
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

  // --- Logique de recherche avec le prompt exact de l'utilisateur ---
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

const handleSearch = () => {
  if (!searchQuery.trim()) {
    addToast({
      title: 'Recherche vide',
      message: 'Veuillez entrer un terme de recherche.',
      variant: 'default',
    });
    return;
  }

  console.log("Exécution de la recherche avec le prompt:", searchQuery);

  executeVoterSearch({
    variables: {
      prompt: searchQuery.trim(), // Le prompt exact tapé par l'utilisateur
    },
    onCompleted: (data) => {
      if (data?.voterSearch) {
        const result: VoterSearchResult = data.voterSearch;
        if (result.error) {
          addToast({
            title: 'Erreur de recherche',
            message: result.error,
            variant: 'error',
          });
          setSearchResults([]);
          return;
        }

        // Transformer chaque user en camelCase avant enrichissement
        const transformedResults = result.data.map(user => toCamelCase(user));

        // Enrichir avec alreadyEligible comme tu le faisais
        const enrichedResults = transformedResults.map(user => ({
          ...user,
          alreadyEligible: eligibleEmails.some(e => e.email === user.email),
        }));

        setSearchResults(enrichedResults);

        if (enrichedResults.length === 0 && searchQuery.trim() !== '') {
          addToast({
            title: 'Aucun résultat',
            message: "Aucun utilisateur trouvé correspondant à votre recherche.",
            variant: 'default',
          });
        }
      }
    },
    onError: (err) => {
      console.error("Erreur lors de la recherche:", err);
      addToast({
        title: 'Erreur de recherche',
        message: "Échec de la recherche d'utilisateurs. Veuillez réessayer.",
        variant: 'error',
      });
      setSearchResults([]);
    },
  });
};


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addFromSearch = async (userToAdd: User) => {
    if (!userToAdd.email) {
      addToast({
        title: 'Email manquant',
        message: `L'utilisateur "${userToAdd.name || 'Inconnu'}" n'a pas d'adresse email.`,
        variant: 'error',
      });
      return;
    }

    if (eligibleEmails.some(ee => ee.email === userToAdd.email)) {
      addToast({
        title: 'Déjà présent',
        message: `L'email "${userToAdd.email}" est déjà dans votre liste.`,
        variant: 'default',
      });
      return;
    }

    try {
      await createEligibleEmailMutation({
        variables: {
          electionId: electionId,
          email: userToAdd.email,
        },
      });
      // Mettre à jour les searchResults localement après ajout réussi
      setSearchResults(searchResults.filter(u => u.id !== userToAdd.id));
    } catch (opError) {
      console.error("Échec de l'ajout depuis la recherche:", opError);
      addToast({
        title: 'Erreur d\'ajout',
        message: "Échec de l'ajout depuis la recherche. Veuillez réessayer.",
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

      {/* Section de recherche AI avec vraies données */}
      <div className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Recherche d'utilisateurs par IA</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Utilisez la recherche IA pour trouver des utilisateurs et les ajouter comme emails éligibles.
        </p>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Rechercher des utilisateurs... (ex: 'tous les utilisateurs de l'informatique')"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searchLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {searchLoading ? (
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
              Résultats de la recherche ({searchResults.length} utilisateurs trouvés)
            </h4>
            {searchResults.map((user) => {
              const isAlreadyEligible = eligibleEmails.some(e => e.email === user.email);
              return (
                <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{user.name || 'Nom non disponible'}</p>
                      <p className="text-sm text-gray-600">{user.email || 'Email non disponible'}</p>
                      {user.gender && <p className="text-xs text-gray-500">Genre: {user.gender}</p>}
                      {user.dateOfBirth && <p className="text-xs text-gray-500">Né(e) le: {user.dateOfBirth}</p>}
                      {isAlreadyEligible && (
                        <p className="text-xs text-green-600 font-semibold">Déjà ajouté</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => addFromSearch(user)}
                    disabled={!user.email || isAlreadyEligible}
                    className={`px-3 py-1 rounded text-sm transition-colors ${isAlreadyEligible
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                  >
                    Ajouter
                  </button>
                </div>
              );
            })}

          </div>
        )}

        {searchError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">Erreur lors de la recherche: {searchError.message}</p>
          </div>
        )}
      </div>

      {/* Liste des emails éligibles actuels */}
      {eligibleEmails.length === 0 && !queryLoading ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun email éligible ajouté pour le moment. Utilisez le bouton "Ajouter un email" ou la recherche IA.</p>
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
                  <p className="text-xs text-gray-500">Élection: {eligibleEmail.election?.name ?? 'N/A'}</p>
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