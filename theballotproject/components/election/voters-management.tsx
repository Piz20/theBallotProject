import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Search, Trash2, Edit, X, Check } from 'lucide-react';
import { Election, User } from '../../interfaces/interfaces';

interface VotersManagementProps {
  election: Election;
  onUpdateVoters: (voters: User[]) => void;
}

const VotersManagement: React.FC<VotersManagementProps> = ({ election, onUpdateVoters }) => {
  // Local state that reflects the election's voters
  const [voters, setVoters] = useState<User[]>([]);
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

  // Update local state when election props change
  useEffect(() => {
    setVoters(election.eligibleVoters || []);
  }, [election.eligibleVoters]);

  // Only notify parent component when local voters state changes
  useEffect(() => {
    // Only call if voters have actually changed
    if (JSON.stringify(voters) !== JSON.stringify(election.eligibleVoters)) {
      onUpdateVoters(voters);
    }
  }, [voters, onUpdateVoters, election.eligibleVoters]);

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const handleAddVoter = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!newVoter.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!newVoter.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(newVoter.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (voters.some((v) => v.email === newVoter.email.trim())) {
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

      setVoters(prevVoters => [...prevVoters, voter]);
      setNewVoter({ name: '', email: '' });
    }
  }, [newVoter, validateEmail, voters]);

  const handleRemoveVoter = useCallback((id: number) => {
    setVoters(prevVoters => prevVoters.filter((voter) => voter.id !== id));
  }, []);

  const startEditing = useCallback((voter: User) => {
    setEditingId(voter.id);
    setEditForm({ ...voter });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setErrors({});
  }, []);

  const saveEdit = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!editForm.name?.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!editForm.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(editForm.email)) {
      newErrors.email = 'Format d\'email invalide';
    } else if (voters.some((v) => v.email === editForm.email.trim() && v.id !== editForm.id)) {
      newErrors.email = 'Cet email est déjà dans la liste';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setVoters(prevVoters =>
        prevVoters.map((voter) =>
          voter.id === editingId
            ? { ...editForm, name: (editForm.name ?? '').trim(), email: editForm.email.trim() }
            : voter
        )
      );
      setEditingId(null);
    }
  }, [editForm, editingId, validateEmail, voters]);

  const handleBulkImport = useCallback(() => {
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

      if (validateEmail(email) && !voters.some((v) => v.email === email)) {
        validEmails.push({ email, name });
      } else {
        invalidEmails.push(email);
      }
    });

    if (validEmails.length > 0) {
      const newVoters = validEmails.map(({ email, name }) => ({
        id: Date.now() + Math.random(), // Ensure unique IDs
        name,
        email,
        createdAt: new Date().toISOString(),
      }));

      setVoters(prevVoters => [...prevVoters, ...newVoters]);
    }

    if (invalidEmails.length > 0) {
      alert(`${validEmails.length} électeurs ajoutés. ${invalidEmails.length} emails invalides ou déjà présents.`);
    } else {
      alert(`${validEmails.length} électeurs ajoutés avec succès.`);
    }

    setIsImportModalOpen(false);
    setBulkEmails('');
  }, [bulkEmails, validateEmail, voters]);

  // Memoize filtered voters to avoid unnecessary recalculations
  const filteredVoters = React.useMemo(() => 
    voters.filter(
      (voter) =>
        voter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [voters, searchTerm]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestion des électeurs</h2>
        <p className="text-gray-600 mb-6">
          Ajoutez les personnes qui pourront voter à cette élection. Ils recevront une invitation par email
          lorsque l'élection sera publiée.
        </p>
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="h-5 w-5 inline-block mr-2" />
          Importer des électeurs
        </button>
      </div>

      {/* Formulaire d'ajout d'un nouvel électeur */}
      <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-medium text-gray-800 mb-4">Ajouter un électeur</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="voterName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="voterName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jean Dupont"
              value={newVoter.name}
              onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="voterEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="voterEmail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="jean.dupont@exemple.com"
              value={newVoter.email}
              onChange={(e) => setNewVoter({ ...newVoter, email: e.target.value })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddVoter}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des électeurs */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Liste des électeurs ({voters.length})</h3>
        </div>

        {voters.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium mb-1">Aucun électeur</h3>
            <p className="text-gray-400 text-sm">
              Commencez par ajouter des électeurs en utilisant le formulaire ci-dessus.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{voter.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{voter.email}</td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {editingId === voter.id ? (
                        <>
                          <input
                            type="text"
                            className="px-2 py-1 border rounded mr-2"
                            value={editForm.name ?? ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                          <input
                            type="email"
                            className="px-2 py-1 border rounded mr-2"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-800">
                            <Check className="h-4 w-4 inline-block mr-1" /> Sauvegarder
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <X className="h-4 w-4 inline-block mr-1" /> Annuler
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(voter)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4 inline-block mr-1" /> Modifier
                          </button>
                          <button
                            onClick={() => handleRemoveVoter(voter.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4 inline-block mr-1" /> Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'importation en masse */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Importer des électeurs</h3>
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom <email@example.com>"
            ></textarea>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none"
              >
                <X className="h-4 w-4 inline-block mr-1" /> Annuler
              </button>
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                <Check className="h-4 w-4 inline-block mr-1" /> Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotersManagement;