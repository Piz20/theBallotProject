import React from 'react';
import { Trophy, Medal, Award, TrendingUp, Activity, BarChart3, Crown, Star, Zap } from 'lucide-react';
import { Candidate } from '@/interfaces//interfaces';
import { GET_CANDIDATES_BY_ELECTION_ID } from '@/lib/mutations/candidateMutations';
import { useQuery } from '@apollo/client';

interface VoteGaugesProps {
  candidates: Candidate[];
  totalVotes: number;
}

const VoteGauges: React.FC<VoteGaugesProps> = ({ candidates, totalVotes }) => {
  const { data: candidatesData } = useQuery(GET_CANDIDATES_BY_ELECTION_ID, {
    variables: {
      electionId: candidates.length
        ? parseInt(String(candidates[0]?.election?.id), 10)
        : 1
    },
    pollInterval: 1500,
    skip: !candidates.length,
  });


  const freshCandidates = candidatesData?.candidatesByElection || candidates;
  const sortedCandidates = [...freshCandidates].sort((a, b) => {
    const aVotes = a.vote_count || a.voteCount || 0;
    const bVotes = b.vote_count || b.voteCount || 0;
    return bVotes - aVotes;
  });

  interface FreshCandidate {
    id: number | string;
    name: string;
    vote_count?: number;
    voteCount?: number;
    election?: {
      id: number | string;
    };
  }

  const freshTotalVotes = freshCandidates.reduce(
    (sum: number, candidate: FreshCandidate) => {
      const voteCount: number = candidate.vote_count || candidate.voteCount || 0;
      return sum + voteCount;
    },
    0
  );

  const getPercentage = (votes: number) => {
    return freshTotalVotes > 0 ? (votes / freshTotalVotes) * 100 : 0;
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0: return Crown;
      case 1: return Medal;
      case 2: return Award;
      default: return Star;
    }
  };

  const getPositionBadge = (index: number) => {
    switch (index) {
      case 0: return { text: '🏆 Leader', style: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case 1: return { text: '🥈 2ème', style: 'bg-gray-100 text-gray-700 border-gray-200' };
      case 2: return { text: '🥉 3ème', style: 'bg-orange-100 text-orange-700 border-orange-200' };
      default: return { text: `#${index + 1}`, style: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  const getGaugeColor = (index: number) => {
    const colors = [
      'from-green-400 to-green-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-orange-400 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm sticky top-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Live Ranking</h3>
            <p className="text-gray-600 text-sm">Real time</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
          <Activity className="w-4 h-4" />
          <span className="font-medium text-sm">LIVE</span>
        </div>
      </div>


      <div className="space-y-6">
        {sortedCandidates.map((candidate, index) => {
          const voteCount = candidate.vote_count || candidate.voteCount || 0;
          const percentage = getPercentage(voteCount);
          const PositionIcon = getPositionIcon(index);
          const badge = getPositionBadge(index);

          return (
            <div key={candidate.id} className="bg-gray-50 rounded-xl p-4 border shadow-sm w-fit max-w-full">
              {/* Header du candidat */}
              <div className="flex items-center justify-between mb-4 w-full">
                <div className="flex items-center space-x-3 min-w-fit">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <PositionIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm whitespace-nowrap">
                      {candidate.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badge.style}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
                
              </div>

              {/* Barre de progression */}
              <div className="mb-4 w-fit min-w-[120px]">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden min-w-[100px]">
                  <div
                    className={`h-full bg-gradient-to-r ${getGaugeColor(index)} rounded-full transition-all duration-1000`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex gap-3 flex-wrap">
                <div className="bg-white rounded p-2 text-center border min-w-fit">
                  <div className="text-sm font-bold text-blue-600">{voteCount}</div>
                  <div className="text-xs text-blue-500">Votes</div>
                </div>

                <div className="bg-white rounded p-2 text-center border min-w-fit">
                  <div className="text-sm font-bold text-green-600">{percentage.toFixed(1)}%</div>
                  <div className="text-xs text-green-500">Part</div>
                </div>

                <div className="bg-white rounded p-2 text-center border min-w-fit">
                  <div className="text-sm font-bold text-purple-600">#{index + 1}</div>
                  <div className="text-xs text-purple-500">Rang</div>
                </div>
              </div>

              {/* Tendance */}
              <div className="mt-3 flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 min-w-fit">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">
                    {index === 0 ? 'En tête' : index === 1 ? 'Challenger' : 'En course'}
                  </span>
                </div>

                <div className="flex items-center space-x-1 min-w-fit">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </div>

          );
        })}
      </div>

      {/* Statistiques globales */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Vue d'ensemble</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{freshTotalVotes}</div>
            <div className="text-blue-700 text-xs font-medium">Total Votes</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{freshCandidates.length}</div>
            <div className="text-purple-700 text-xs font-medium">Candidats</div>
          </div>
        </div>

        {/* Écart */}
        {sortedCandidates.length > 1 && (
          <div className="mt-4 bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="text-center">
              <div className="text-sm font-bold text-amber-600">
                {Math.abs(getPercentage(sortedCandidates[0]?.vote_count || sortedCandidates[0]?.voteCount || 0) -
                  getPercentage(sortedCandidates[1]?.vote_count || sortedCandidates[1]?.voteCount || 0)).toFixed(1)}%
              </div>
              <div className="text-amber-700 text-xs font-medium">Écart leader/2ème</div>
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de synchronisation */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <Activity className="w-3 h-3" />
          <span className="font-medium text-xs">Sync 1.5s</span>
        </div>
      </div>
    </div>
  );
};

export default VoteGauges;