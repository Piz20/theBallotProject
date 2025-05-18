'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { Vote, ArrowLeft } from 'lucide-react';
import ElectionSettings from '../../../../components/election/election-settings';
import { Election, User } from '../../../../interfaces/interfaces';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GET_ELECTION_BY_ID } from '@/lib/mutations/electionMutations';


const ElectionSettingsPage: React.FC = () => {
  const { id } = useParams();
  // Requête GraphQL pour récupérer l'élection
  const idValue = typeof id === 'string' ? parseInt(id, 10) : undefined;
  console.log('Query variable id:', idValue , 'Type:', typeof idValue);

  const { data, loading, error } = useQuery(GET_ELECTION_BY_ID, {
    variables: { id: idValue },
    skip: !idValue || isNaN(idValue),
  });

  // État local de l'élection
  const [election, setElection] = useState<Election | null>(null);

  // États pour la gestion des votants
  const [searchTerm, setSearchTerm] = useState('');
  const [newVoter, setNewVoter] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<User>({
    id: 0,
    name: '',
    email: '',
    createdAt: new Date().toISOString(),
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');

  // Dès que les données sont chargées, on initialise l'état election
  useEffect(() => {
    if (data?.election) {
      setElection(data.election);
    }
  }, [data]);

  // Affichage lors du chargement ou erreur
  if (loading) return <p>Chargement de l'élection...</p>;
  if (error) return <p>Erreur : {error.message}</p>;
  if (!election) return <p>Élection non trouvée.</p>;

  // Validation email simple
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Ajout d'un nouvel électeur
  const handleAddVoter = () => {
    const newErrors: typeof errors = {};
    if (!newVoter.name.trim()) newErrors.name = 'Le nom est requis';
    if (!newVoter.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(newVoter.email)) {
      newErrors.email = "Format d'email invalide";
    } else if (election.eligibleVoters.some((v) => v.email === newVoter.email.trim())) {
      newErrors.email = "Cet email est déjà dans la liste";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const voter: User = {
        id: Date.now(),
        name: newVoter.name.trim(),
        email: newVoter.email.trim(),
        createdAt: new Date().toISOString(),
      };

      setElection({
        ...election,
        eligibleVoters: [...election.eligibleVoters, voter],
      });
      setNewVoter({ name: '', email: '' });
    }
  };

  // Suppression d'un électeur
  const handleRemoveVoter = (id: number) => {
    setElection({
      ...election,
      eligibleVoters: election.eligibleVoters.filter((v) => v.id !== id),
    });
  };

  // Commencer l'édition d'un électeur
  const startEditing = (voter: User) => {
    setEditingId(voter.id);
    setEditForm({ ...voter });
    setErrors({});
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingId(null);
    setErrors({});
  };

  // Sauvegarder l'édition
  const saveEdit = () => {
    const newErrors: typeof errors = {};
    if (!editForm.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!editForm.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(editForm.email)) {
      newErrors.email = "Format d'email invalide";
    } else if (
      election.eligibleVoters.some(
        (v) => v.email === editForm.email.trim() && v.id !== editForm.id
      )
    ) {
      newErrors.email = "Cet email est déjà dans la liste";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setElection({
        ...election,
        eligibleVoters: election.eligibleVoters.map((v) =>
          v.id === editingId ? { ...editForm, email: editForm.email.trim() } : v
        ),
      });
      setEditingId(null);
    }
  };

  // Import massif d'emails via textarea
  const handleBulkImport = () => {
    const emailList = bulkEmails
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const validEmails: { email: string; name: string }[] = [];
    const invalidEmails: string[] = [];

    emailList.forEach((entry) => {
      const emailRegex = /<([^>]+)>/;
      const nameMatch = entry.match(emailRegex);
      let email, name;

      if (nameMatch) {
        email = nameMatch[1];
        name = entry.split('<')[0].trim();
      } else {
        email = entry;
        name = email.split('@')[0];
      }

      if (validateEmail(email) && !election.eligibleVoters.some((v) => v.email === email)) {
        validEmails.push({ email, name });
      } else {
        invalidEmails.push(email);
      }
    });

    if (validEmails.length > 0) {
      const newVoters: User[] = validEmails.map(({ email, name }, index) => ({
        id: Date.now() + index,
        name,
        email,
        createdAt: new Date().toISOString(),
      }));

      setElection({
        ...election,
        eligibleVoters: [...election.eligibleVoters, ...newVoters],
      });
    }

    if (invalidEmails.length > 0) {
      alert(`${validEmails.length} électeurs ajoutés. ${invalidEmails.length} emails invalides ou déjà présents.`);
    } else {
      alert(`${validEmails.length} électeurs ajoutés avec succès.`);
    }

    setIsImportModalOpen(false);
    setBulkEmails('');
  };

  // Filtrer la liste des électeurs selon la recherche
  const filteredVoters = election.eligibleVoters.filter(
    (voter) =>
      voter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Vote className="h-8 w-8 text-primary heartbeat" />
          <h1 className="text-3xl font-bold">TheBallotProject</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/elections">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8">
        <ElectionSettings election={election} onUpdateElection={setElection} />

        {/* Tu peux ici ajouter la gestion des votants (ajout, édition, suppression, import) */}
        {/* Par exemple un champ recherche, liste filtrée filteredVoters, etc. */}
        {/* Je ne modifie pas ta UI donc je ne rajoute pas ce code ici, mais tu as tous les handlers prêts */}
      </main>

      <Footer />
    </div>
  );
};

export default ElectionSettingsPage;
