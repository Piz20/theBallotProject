import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import {
  GET_ALL_CANDIDATES,
  CREATE_CANDIDATE,
  UPDATE_CANDIDATE,
  DELETE_CANDIDATE,
} from '@/lib/mutations/candidateMutations';
import ImageUploadSelection from '@/components/election-settings/election/election-settings/image-upload-selection';

interface CandidatesSectionProps {
  electionId?: number;
}

export default function CandidatesSection({ electionId }: CandidatesSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageFile: '',
    imageUrl: '',
  });

  const { data, loading, error, refetch } = useQuery(GET_ALL_CANDIDATES);
  const [createCandidate] = useMutation(CREATE_CANDIDATE);
  const [updateCandidate] = useMutation(UPDATE_CANDIDATE);
  const [deleteCandidate] = useMutation(DELETE_CANDIDATE);

  const candidates =
    data?.allCandidates?.filter(
      (c: any) => String(c.election?.id) === String(electionId)
    ) || [];

  const getImageSrc = (candidate: any) => {
    if (candidate.imageFile) {
      return `http://localhost:8000/media/${candidate.imageFile}`;
    } else if (candidate.imageUrl) {
      return candidate.imageUrl;
    }
    return '';
  };

  const handleImageChange = (imageType: "url" | "file", value: string) => {
    if (!formData) return;
    if (imageType === "url") {
      setFormData({ ...formData, imageUrl: value, imageFile: '' });
    } else {
      setFormData({ ...formData, imageFile: value, imageUrl: '' });
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!electionId) return;

  try {
    if (editingCandidate) {
      console.log(formData.imageUrl, formData.imageFile);
      await updateCandidate({
        variables: {
          id: parseInt(editingCandidate.id),
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl || null,
          imageFile: formData.imageFile || null,
          electionId,
        },
      });
      alert('Candidate updated successfully!');
    } else {
      await createCandidate({
        variables: {
          name: formData.name,
          description: formData.description,
          electionId,
          imageUrl: formData.imageUrl || null,
          imageFile: formData.imageFile || null,
        },
      });
      alert('Candidate created successfully!');
    }

    await refetch();
    setEditingCandidate(null);
    setFormData({ name: '', description: '', imageFile: '', imageUrl: '' });
    setShowAddForm(false);
  } catch (err) {
    console.error('Error saving candidate:', err);
    alert('Error saving candidate');
  }
};


  const handleEdit = (candidate: any) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      description: candidate.description || '',
      imageFile: candidate.imageFile || '',
      imageUrl: candidate.imageUrl || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {

      await deleteCandidate({ variables: { id: parseInt(id) } }); // 👈 envoie l'id sous forme de string à la mutation
      await refetch(); // 👈 recharge la liste des candidats après suppression
    } catch (err) {
      console.error('Error deleting candidate:', err); // 👈 affiche une erreur en cas d’échec
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCandidate(null);
    setFormData({ name: '', description: '', imageFile: '', imageUrl: '' });
  };

  if (error) return <p>Error loading candidates.</p>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Candidates Management</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-50 border p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <ImageUploadSelection
              imageUrl={formData.imageUrl}
              imageFile={formData.imageFile}
              onChange={(handleImageChange)}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {editingCandidate ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : candidates.length === 0 ? (
        <p className="text-gray-500">No candidates yet.</p>
      ) : (
        <div className="space-y-4">
          {candidates.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 p-4 border rounded-lg">
              {getImageSrc(c) ? (
                <img
                  src={getImageSrc(c)}
                  alt={c.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500">{c.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
