import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserCircle, Plus, Trash2, Edit, X, Image, User } from 'lucide-react';
import { Candidate, Election } from '../../interfaces/interfaces';

interface CandidatesManagementProps {
  election: Election;
  onUpdateCandidates: (candidates: Candidate[]) => void;
}

const CandidatesManagement: React.FC<CandidatesManagementProps> = ({ election, onUpdateCandidates }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Candidate, 'id' | 'vote_count' | 'created_at' | 'election'>>({
    name: '',
    bio: '',
    profile_picture: '',
  });
  const [errors, setErrors] = useState<{ name?: string; bio?: string; profile_picture?: string }>({});

  // Initialize candidates from props
  useEffect(() => {
    setCandidates(election.candidates || []);
  }, [election.candidates]);

  // Notify parent of changes
  useEffect(() => {
    // Only call if candidates have actually changed
    if (JSON.stringify(candidates) !== JSON.stringify(election.candidates)) {
      onUpdateCandidates(candidates);
    }
  }, [candidates, onUpdateCandidates, election.candidates]);

  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.bio.trim()) newErrors.bio = 'La biographie est requise';
    else if (formData.bio.length > 500) newErrors.bio = '500 caractères max.';
    if (formData.profile_picture && !isValidUrl(formData.profile_picture)) newErrors.profile_picture = "URL invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData({ name: '', bio: '', profile_picture: '' });
    setEditingId(null);
    setErrors({});
  }, []);

  const openAddModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback((candidate: Candidate) => {
    setFormData({
      name: candidate.name,
      bio: candidate.bio,
      profile_picture: candidate.profile_picture || '',
    });
    setEditingId(candidate.id !== undefined && candidate.id !== null ? candidate.id.toString() : null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    const profile_picture = formData.profile_picture?.trim() || null;

    if (editingId !== null) {
      const id = parseInt(editingId);
      // Update existing candidate
      setCandidates(prev => prev.map(c => 
        c.id === id 
          ? { 
              ...c, 
              name: formData.name.trim(), 
              bio: formData.bio.trim(), 
              profile_picture 
            } 
          : c
      ));
    } else {
      // Create new candidate
      const newCandidate: Candidate = {
        id: Date.now(),
        election: {
          id: election.id,
          name: election.name,
        },
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        profile_picture,
        vote_count: 0,
        created_at: new Date().toISOString(),
      };
      setCandidates(prev => [...prev, newCandidate]);
    }

    closeModal();
  }, [validateForm, formData, editingId, closeModal]);

  const handleDelete = useCallback((id?: string) => {
    if (!id) return;
    const intId = parseInt(id);
    setCandidates(prev => prev.filter(c => c.id !== intId));
  }, []);

  const getRandomPlaceholderUrl = useCallback(() => {
    const placeholders = [
      'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      'https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg',
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Candidats de l'élection : {election.name}</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="inline-block w-4 h-4 mr-1" /> Ajouter un candidat
        </button>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center text-gray-500">Aucun candidat pour cette élection.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(c => (
            <div key={c.id ?? c.name} className="bg-white p-4 rounded shadow-sm border">
              <div className="relative">
                {c.profile_picture ? (
                  <img src={c.profile_picture} alt={c.name} className="w-full h-48 object-cover rounded" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 space-x-2">
                  <button onClick={() => openEditModal(c)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(c.id?.toString())} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{c.bio}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{editingId ? "Modifier" : "Ajouter"} un candidat</h3>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Biographie</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                ></textarea>
                <p className="text-xs text-gray-500">{formData.bio.length}/500</p>
                {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Photo (URL)</label>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.profile_picture || ''}
                    onChange={e => setFormData({ ...formData, profile_picture: e.target.value })}
                    className="w-full border px-3 py-2 rounded-l"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile_picture: getRandomPlaceholderUrl() })}
                    className="px-3 py-2 bg-gray-100 rounded-r hover:bg-gray-200"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                {errors.profile_picture && <p className="text-sm text-red-600">{errors.profile_picture}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button onClick={closeModal} className="px-4 py-2 border rounded">Annuler</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
                {editingId ? "Mettre à jour" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesManagement;