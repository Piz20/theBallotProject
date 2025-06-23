import React from 'react';
import { Vote, CheckCircle, User, TrendingUp, Loader2, RefreshCw, Crown, Medal, Award, Star, Heart, Zap } from 'lucide-react';
import { Candidate } from '@/interfaces/interfaces';
import { GET_CANDIDATES_BY_ELECTION_ID } from '@/lib/mutations/candidateMutations';
import { useQuery } from '@apollo/client';
interface CandidateCardProps {
  candidate: Candidate;
  totalVotes: number;
  isSelected: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  onVote: (candidateId: number) => void;
  canVote: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  totalVotes,
  isSelected,
  hasVoted,
  isVoting,
  onVote,
  canVote
}) => {
  
  const rawElectionId = candidate.election?.id;
  const electionId = rawElectionId && !isNaN(parseInt(String(rawElectionId), 10))
    ? parseInt(String(rawElectionId), 10)
    : 1;

  const { data: candidatesData } = useQuery(GET_CANDIDATES_BY_ELECTION_ID, {
    variables: { electionId },
    pollInterval: 2000,
    skip: !rawElectionId,
  });

  const freshCandidate = candidatesData?.candidatesByElection?.find((c: Candidate) => c.id === candidate.id) || candidate;
  const voteCount = freshCandidate.voteCount || 0;
  const percentage = totalVotes > 0 ? (freshCandidate.voteCount / totalVotes) * 100 : 0;

  const allCandidates = candidatesData?.candidatesByElection || [candidate];
  const sortedCandidates = [...allCandidates].sort((a, b) => {
    const aVotes = a.vote_count || a.voteCount || 0;
    const bVotes = b.vote_count || b.voteCount || 0;
    return bVotes - aVotes;
  });
  const position = sortedCandidates.findIndex(c => c.id === candidate.id) + 1;

  const handleVoteClick = () => {
    if (canVote && !isVoting) {
      onVote(candidate.id);
    }
  };
  const getButtonState = () => {
    if (!canVote) return {
      text: 'Voting closed',
      disabled: true,
      style: 'bg-gray-400 cursor-not-allowed',
      icon: Vote
    };

    if (isVoting) return {
      text: 'Voting in progress...',
      disabled: true,
      style: 'bg-blue-500',
      icon: Loader2
    };

    if (hasVoted && isSelected) return {
      text: 'Change vote',
      disabled: false,
      style: 'bg-orange-500 hover:bg-orange-600',
      icon: RefreshCw
    };

    if (hasVoted && !isSelected) return {
      text: 'Vote for this candidate',
      disabled: false,
      style: 'bg-blue-600 hover:bg-blue-700',
      icon: Vote
    };

    return {
      text: 'Vote now',
      disabled: false,
      style: 'bg-green-600 hover:bg-green-700',
      icon: Vote
    };
  };

  const getPositionIcon = () => {
    switch (position) {
      case 1: return Crown;
      case 2: return Medal;
      case 3: return Award;
      default: return Star;
    }
  };

  const getPositionBadge = () => {
    switch (position) {
      case 1: return { text: '🏆 #1', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 2: return { text: '🥈 #2', style: 'bg-gray-100 text-gray-700 border-gray-200' };
      case 3: return { text: '🥉 #3', style: 'bg-orange-100 text-orange-700 border-orange-200' };
      default: return { text: `#${position}`, style: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const buttonState = getButtonState();
  const ButtonIcon = buttonState.icon;
  const PositionIcon = getPositionIcon();
  const positionBadge = getPositionBadge();

  return (
    <div className={`relative bg-white rounded-lg p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200'} ${isVoting ? 'scale-[1.02]' : ''}`}>

      {/* ✅ Coche verte si sélectionné */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-20">
          <div className="bg-green-500 rounded-full p-1 shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Overlay de vote en cours */}
      {isVoting && (
        <div className="absolute inset-0 bg-blue-50/90 rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h3 className="text-lg font-bold text-blue-600 mb-1">
              {hasVoted ? 'Modification in progress...' : 'Recording your vote...'}
            </h3>
            <p className="text-gray-600 text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* Corps de la carte */}
      <div className="flex items-center space-x-6">
        {/* Image du candidat */}
        <div className="flex-shrink-0">
          {freshCandidate.imageUrl ? (
            <img
              src={freshCandidate.imageUrl}
              alt={freshCandidate.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center border-2 border-gray-200">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Infos du candidat */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{freshCandidate.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${positionBadge.style}`}>
                  {positionBadge.text}
                </span>
              </div>

              <p className="text-gray-600 mb-4 text-sm">
                {freshCandidate.description || 'Candidate committed to change.'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{voteCount}</div>
                  <div className="text-blue-500 text-xs font-medium">Votes</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{percentage.toFixed(1)}%</div>
                  <div className="text-green-500 text-xs font-medium">Share</div>
                </div>
              </div>
            </div>

            {/* Zone de vote */}
            <div className="flex flex-col items-end space-y-4 ml-6">
              <button
                onClick={handleVoteClick}
                disabled={buttonState.disabled}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center space-x-2 ${buttonState.style} ${!buttonState.disabled ? 'transform hover:scale-105' : 'cursor-not-allowed opacity-75'}`}
              >
                <ButtonIcon className={`w-4 h-4 ${isVoting ? 'animate-spin' : ''}`} />
                <span>{buttonState.text}</span>
              </button>

              <div className="w-32">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                  <p className="text-gray-500 text-xs">of votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
};

export default CandidateCard;