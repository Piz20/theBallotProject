import React, { useState, useCallback } from 'react';
import {
  CalendarClock,
  Users,
  UserCircle,
  Save,
  AlertTriangle
} from 'lucide-react';
import { gql, useMutation } from '@apollo/client';

import DateSettings from './date-settings';
import VotersManagement from './voters-management';
import CandidatesManagement from './candidates-management';
import { Election, User, Candidate } from '../../interfaces/interfaces';
import { UPDATE_ELECTION } from '../../lib/mutations/electionMutations';

interface ElectionSettingsProps {
  election: Election;
  onUpdateElection: (election: Election) => void;
}


const ElectionSettings: React.FC<ElectionSettingsProps> = ({ election, onUpdateElection }) => {
  const [activeTab, setActiveTab] = useState<'dates' | 'voters' | 'candidates'>('dates');
  const [isDirty, setIsDirty] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const [updateElectionMutation, { loading }] = useMutation(UPDATE_ELECTION);

  const handleSave = useCallback(async () => {
    try {
      const eligibleVotersIds = election.eligibleVoters?.map(v => v.id) || [];
      const candidateIds = election.candidates?.map(c => c.id) || [];

      const { data } = await updateElectionMutation({
        variables: {
          id: election.id,
          name: election.name,
          startDate: election.startDate,
          endDate: election.endDate,
          description: election.description,
          status: election.status,
          eligibleVotersIds,
          candidateIds,
        },
      });

      if (data?.updateElection?.success) {
        onUpdateElection(data.updateElection.election);
        setIsDirty(false);
        setShowSavedMessage(true);
        setTimeout(() => setShowSavedMessage(false), 3000);
      } else {
        alert('Erreur: ' + (data?.updateElection?.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur mutation updateElection:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }, [election, onUpdateElection, updateElectionMutation]);

  const updateElection = useCallback((updates: Partial<Election>) => {
    onUpdateElection({ ...election, ...updates });
    setIsDirty(true);
  }, [election, onUpdateElection]);

  const handleDateChange = useCallback((startDate: Date, endDate: Date) => {
    updateElection({ startDate, endDate });
  }, [updateElection]);

  const handleUpdateVoters = useCallback((eligibleVoters: User[]) => {
    updateElection({ eligibleVoters });
  }, [updateElection]);

  const handleUpdateCandidates = useCallback((candidates: Candidate[]) => {
    updateElection({ candidates });
  }, [updateElection]);

  const canPublish = useCallback((): boolean => {
    return !!election.startDate &&
      !!election.endDate &&
      (election.eligibleVoters?.length ?? 0) > 0 &&
      ((election.candidates?.length ?? 0) > 0);
  }, [election]);

  const handlePublish = useCallback(() => {
    if (canPublish()) {
      updateElection({ status: 'active' });
    }
  }, [canPublish, updateElection]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{election.name}</h1>
            <p className="text-gray-500 mt-1">{election.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${!election.status || election.status.toLowerCase() === 'draft'
                    ? 'bg-gray-200 text-gray-700'
                    : election.status.toLowerCase() === 'upcoming'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : election.status.toLowerCase() === 'active'
                        ? 'bg-green-100 text-green-800 animate-pulse'
                        : 'bg-gray-900 text-gray-100'
                  }`}
              >
                {!election.status || election.status.toLowerCase() === 'draft'
                  ? 'Draft'
                  : election.status.toLowerCase() === 'upcoming'
                    ? 'Upcoming'
                    : election.status.toLowerCase() === 'active'
                      ? 'Active'
                      : 'Completed'}
              </span>

            </div>
            <button
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${isDirty && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              onClick={handleSave}
              disabled={!isDirty || loading}
            >
              <Save className="w-4 h-4 inline-block mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {showSavedMessage && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <span className="flex-shrink-0 mr-2">✓</span>
            <span>Changes have been successfully saved</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'dates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('dates')}
          >
            <CalendarClock className="w-4 h-4 inline-block mr-2" />
            Election Dates
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'voters'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('voters')}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Voters
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none whitespace-nowrap ${activeTab === 'candidates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('candidates')}
          >
            <UserCircle className="w-4 h-4 inline-block mr-2" />
            Candidates
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'dates' && (
          <DateSettings
            startDate={election.startDate}
            endDate={election.endDate}
            onDateChange={handleDateChange}
          />
        )}

        {activeTab === 'voters' && (
          <VotersManagement
            election={election}
            onUpdateVoters={handleUpdateVoters}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesManagement
            election={election}
            onUpdateCandidates={handleUpdateCandidates}
          />
        )}
      </div>

      {/* Publication Banner */}
      {election.status === 'draft' && (
        <div className="border-t border-gray-200 bg-blue-50 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">This election is in draft mode</h3>
                <p className="text-sm text-blue-600 mt-1">
                  {canPublish()
                    ? "You can now publish this election to allow voters to vote."
                    : "To publish this election, you must configure dates, add voters, and candidates."}
                </p>
              </div>
            </div>
            <button
              className={`px-4 py-2 rounded-md font-medium ${canPublish()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              disabled={!canPublish()}
              onClick={handlePublish}
            >
              Publish Election
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionSettings;
