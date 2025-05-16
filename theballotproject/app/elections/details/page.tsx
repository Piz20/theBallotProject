"use client";
import React, { useState, useEffect } from 'react';
import { CalendarClock, Users, UserCircle, ChevronLeft, Vote } from 'lucide-react';
import ElectionDetails from '../../../components/election/election-details';
import { Election, User } from '../../../interfaces/interfaces';
import Footer from '@/components/ui/footer';

// Mock data to simulate the created election
const mockElection: Election = {
  id: 1,
  name: "Élection du Bureau Exécutif 2024",
  description: "Élection annuelle pour désigner les membres du bureau exécutif de l'association pour l'année 2024.",
  startDate: new Date(),
  endDate: new Date(),
  createdAt: new Date().toISOString(),
  eligibleVoters: [],
  status: "draft",
};

const App: React.FC = () => {
  const [election, setElection] = useState<Election>(mockElection);
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

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAddVoter = () => {
    const newErrors: typeof errors = {};
    if (!newVoter.name.trim()) newErrors.name = 'Le nom est requis';
    if (!newVoter.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(newVoter.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (election.eligibleVoters.some((v) => v.email === newVoter.email.trim())) {
      newErrors.email = 'Cet email est déjà dans la liste';
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

  const handleRemoveVoter = (id: number) => {
    setElection({
      ...election,
      eligibleVoters: election.eligibleVoters.filter((v) => v.id !== id),
    });
  };

  const startEditing = (voter: User) => {
    setEditingId(voter.id);
    setEditForm({ ...voter });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setErrors({});
  };

  const saveEdit = () => {
    const newErrors: typeof errors = {};
    if (!editForm.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!editForm.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(editForm.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (election.eligibleVoters.some((v) => v.email === editForm.email.trim() && v.id !== editForm.id)) {
      newErrors.email = 'Cet email est déjà dans la liste';
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

  const filteredVoters = election.eligibleVoters.filter(
    (voter) =>
      voter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-7 w-7 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">TheBallotProject</h1>
          </div>
          <button
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => alert("Retour au tableau de bord")}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Retour</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ElectionDetails election={election} onUpdateElection={setElection} />
      </main>

      <Footer />
    </div>
  );
};

export default App;
