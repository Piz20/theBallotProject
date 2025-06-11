import React, { useState } from 'react';
import { Mail, Search, UserPlus, Trash2, Sparkles, Users, Plus, Edit2 } from 'lucide-react';

interface Voter {
  id: number;
  email: string;
  name?: string;
  addedAt: Date;
}

interface VotersSelectionProps { // Renamed interface
  electionId: number;
}

const VotersSelection: React.FC<VotersSelectionProps> = ({ electionId }) => { // Renamed component
  const [voters, setVoters] = useState<Voter[]>([
    { id: 1, email: 'john.doe@example.com', name: 'John Doe', addedAt: new Date() },
    { id: 2, email: 'jane.smith@example.com', name: 'Jane Smith', addedAt: new Date() },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  
  const [aiQuery, setAiQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Voter[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic email validation
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address.'); // Added a basic alert for invalid email
      return;
    }

    // Check for duplicate email when adding a new voter
    if (!editingVoter && voters.some(v => v.email === formData.email)) {
      alert('A voter with this email already exists.');
      return;
    }

    if (editingVoter) {
      setVoters(voters.map(v => 
        v.id === editingVoter.id 
          ? { ...v, email: formData.email, name: formData.name || undefined } // Ensure name is undefined if empty
          : v
      ));
    } else {
      const newVoter: Voter = {
        id: Date.now(), // Using Date.now() for a simple unique ID
        email: formData.email,
        name: formData.name || undefined, // Ensure name is undefined if empty
        addedAt: new Date(),
      };
      setVoters([...voters, newVoter]);
    }

    setFormData({ email: '', name: '' });
    setShowAddForm(false);
    setEditingVoter(null);
  };

  const handleEdit = (voter: Voter) => {
    setEditingVoter(voter);
    setFormData({
      email: voter.email,
      name: voter.name || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this voter?')) { // Confirmation dialog
      setVoters(voters.filter(voter => voter.id !== id));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingVoter(null);
    setFormData({ email: '', name: '' });
  };

  // Debounce function for AI search input (to avoid excessive API calls)
  const debounce = (func: Function, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedAiSearch = React.useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      // Simulate AI search API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const mockResults: Voter[] = [
        { id: 100, email: 'alice.johnson@company.com', name: 'Alice Johnson', addedAt: new Date() },
        { id: 101, email: 'bob.wilson@org.com', name: 'Bob Wilson', addedAt: new Date() },
        { id: 102, email: 'charlie.brown@mail.com', name: 'Charlie Brown', addedAt: new Date() },
      ].filter(voter => 
        voter.email.toLowerCase().includes(query.toLowerCase()) || 
        (voter.name && voter.name.toLowerCase().includes(query.toLowerCase()))
      );

      // Filter out voters already present in the main voters list
      const filteredResults = mockResults.filter(
        (result) => !voters.some((voter) => voter.email === result.email)
      );

      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 500), // Debounce for 500ms
    [voters] // Depend on voters to ensure correct filtering
  );

  const handleAiQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setAiQuery(query);
    debouncedAiSearch(query); // Call debounced search
  };

  const addFromSearch = (voter: Voter) => {
    // Check if voter already exists in the main list before adding
    if (!voters.some(v => v.email === voter.email)) {
      setVoters([...voters, { ...voter, id: Date.now() }]); // Assign a new ID to avoid conflicts with mock IDs
    } else {
      alert(`Voter with email "${voter.email}" is already in your list.`);
    }
    setSearchResults(searchResults.filter(v => v.id !== voter.id)); // Remove from search results after adding
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Voters Management</h2>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingVoter(null); setFormData({ email: '', name: '' }); }} // Reset form on add click
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Voter
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-gray-50 border p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {editingVoter ? 'Edit Voter' : 'Add Voter'}
          </h3>
          <div>
            <label htmlFor="voter-email" className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              id="voter-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="voter@example.com"
            />
          </div>
          <div>
            <label htmlFor="voter-name" className="block text-sm font-medium mb-1">Full Name (Optional)</label>
            <input
              id="voter-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              {editingVoter ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* AI Search Section */}
      <div className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">AI Voter Search</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Use AI to find and add voters from your organization's database
        </p>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search for voters by department, role, or criteria..."
            value={aiQuery}
            onChange={handleAiQueryChange} // Changed to handle debounced search
            onKeyPress={(e) => e.key === 'Enter' && debouncedAiSearch(aiQuery)} // Call debounced search on Enter
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={() => debouncedAiSearch(aiQuery)} // Explicit call on button click
            disabled={!aiQuery.trim() || isSearching}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Search Results
            </h4>
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    {result.name && <p className="font-medium text-gray-900">{result.name}</p>}
                    <p className="text-sm text-gray-600">{result.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => addFromSearch(result)}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voters List */}
      {voters.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No voters added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Voters ({voters.length})
          </h3>
          {voters.map((voter) => (
            <div key={voter.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                {voter.name && <p className="font-medium text-gray-900">{voter.name}</p>}
                <p className="text-sm text-gray-600">{voter.email}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(voter)} 
                  className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                  aria-label={`Edit ${voter.name || voter.email}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(voter.id)} 
                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                  aria-label={`Delete ${voter.name || voter.email}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotersSelection; // Export the renamed component