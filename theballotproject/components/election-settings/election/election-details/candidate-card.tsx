import React from 'react';
import { User, Vote, Check } from 'lucide-react';
import { Candidate } from '@/interfaces/interfaces';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (candidateId: number) => void;
  hasVoted: boolean;
  votedFor: number | null;
  totalVotes: number;
  isElectionEnded: boolean;
  voteMessage?: string;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onVote,
  hasVoted,
  votedFor,
  totalVotes,
  isElectionEnded,
}) => {
  const votePercentage = totalVotes > 0 ? ((candidate.vote_count ?? 0) / totalVotes) * 100 : 0;
  const isVotedFor = votedFor === candidate.id;
  const imageSrc = candidate.imageUrl || candidate.imageFile || null;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border-2 ${
        isVotedFor ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={candidate.name ?? 'Candidat'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={32} className="text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">
            {candidate.name ?? 'Nom inconnu'}
          </h3>
          {candidate.election?.name && (
            <p className="text-sm text-blue-500 font-medium">{candidate.election.name}</p>
          )}
        </div>
        {isVotedFor && <Check className="text-green-500" size={24} />}
      </div>

      {candidate.description && (
        <p className="text-gray-600 mb-4 text-sm">{candidate.description}</p>
      )}

      {candidate.created_at && (
        <div className="mb-3 text-xs text-gray-400">
          Ajouté le {new Date(candidate.created_at).toLocaleDateString()}
        </div>
      )}

      <div className="mb-4 text-sm font-medium text-gray-700">
        {candidate.vote_count ?? 0} vote{(candidate.vote_count ?? 0) !== 1 ? 's' : ''}
      </div>

      {isElectionEnded && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Résultats</span>
            <span className="text-sm font-bold text-gray-800">{votePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${votePercentage}%`,
                backgroundColor: '#3B82F6',
              }}
            />
          </div>
        </div>
      )}

      {/* ✅ BOUTON MODIFIÉ */}
      <button
        onClick={() => onVote(candidate.id)}
        disabled={isElectionEnded}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
          ${isElectionEnded
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isVotedFor
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'}
        `}
      >
        <Vote size={18} />
        <span>
          {isElectionEnded
            ? 'Vote terminé'
            : isVotedFor
            ? 'Vote enregistré'
            : 'Voter'}
        </span>
      </button>
    </div>
  );
};

export default CandidateCard;
