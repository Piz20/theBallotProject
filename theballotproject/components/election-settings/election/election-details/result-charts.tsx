"use client";

import React, { memo, useMemo } from 'react';
import { Crown, Award, Medal, BarChart3, Sparkles, Activity, Trophy } from 'lucide-react';
import { Candidate } from '@/interfaces/interfaces';
import { GET_CANDIDATES_BY_ELECTION_ID } from '@/lib/mutations/candidateMutations';
import { useQuery } from '@apollo/client';

interface ResultsChartProps {
  electionId: number;
  isElectionEnded?: boolean;
}

const WinnerBanner: React.FC<{ winner: Candidate; totalVotes: number }> = ({ winner, totalVotes }) => {
  const voteCount = winner.voteCount || 0;
  const percentage = useMemo(
    () => (totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0),
    [voteCount, totalVotes]
  );

  return (
    <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white p-10 rounded-3xl mb-10 text-center shadow-2xl border border-yellow-300 overflow-hidden">
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

      <div className="relative z-10">
        <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl w-fit mx-auto mb-8 shadow-xl">
          <Trophy className="mx-auto text-white animate-bounce" size={64} />
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          <Sparkles className="w-10 h-10 animate-pulse" />
          <h2 className="text-5xl font-bold">Victoire !</h2>
          <Sparkles className="w-10 h-10 animate-pulse" />
        </div>

        <p className="text-3xl font-semibold mb-6">{winner.name} remporte l'élection</p>

        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 inline-block shadow-xl">
          <div className="text-2xl font-bold mb-2">
            {percentage.toFixed(1)}% des voix
          </div>
          <div className="text-lg opacity-90">
            {voteCount.toLocaleString()} votes sur {totalVotes.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CandidateBarProps {
  candidate: Candidate;
  totalVotes: number;
  index: number;
}

const CandidateBar: React.FC<CandidateBarProps> = ({ candidate, totalVotes, index }) => {
  const voteCount = candidate.voteCount || 0;
  const percentage = useMemo(
    () => (totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0),
    [voteCount, totalVotes]
  );

  const getIcon = useMemo(() => {
    switch (index) {
      case 0:
        return <Crown className="text-yellow-500" size={28} />;
      case 1:
        return <Award className="text-gray-400" size={28} />;
      case 2:
        return <Medal className="text-amber-600" size={28} />;
      default:
        return (
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {index + 1}
          </div>
        );
    }
  }, [index]);

  const getGradient = useMemo(() => {
    const gradients = [
      'from-emerald-400 via-emerald-500 to-emerald-600',
      'from-blue-400 via-blue-500 to-blue-600',
      'from-purple-400 via-purple-500 to-purple-600',
      'from-pink-400 via-pink-500 to-pink-600',
      'from-indigo-400 via-indigo-500 to-indigo-600',
      'from-orange-400 via-orange-500 to-orange-600'
    ];
    return gradients[index % gradients.length];
  }, [index]);

  const getPositionStyle = () => {
    switch (index) {
      case 0: return 'from-yellow-400 to-amber-500 shadow-yellow-200';
      case 1: return 'from-gray-300 to-gray-400 shadow-gray-200';
      case 2: return 'from-amber-600 to-orange-600 shadow-orange-200';
      default: return 'from-blue-400 to-blue-500 shadow-blue-200';
    }
  };

  return (
    <div className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className={`p-4 bg-gradient-to-r ${getPositionStyle()} rounded-2xl shadow-lg`}>
              {getIcon}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-2xl group-hover:text-blue-600 transition-colors duration-300">
                {candidate.name}
              </h4>
              <div className="flex items-center space-x-3 mt-2">
                <span className="text-sm text-gray-500 font-medium">Position #{index + 1}</span>
                {index === 0 && (
                  <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                    🏆 Leader
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-lg text-gray-600 font-medium">
              {voteCount.toLocaleString()} votes
            </div>
          </div>
        </div>

        {/* Barre de progression ultra-moderne */}
        <div className="relative mb-6">
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${getGradient} rounded-full transition-all duration-1500 ease-out relative shadow-lg`}
              style={{ width: `${Math.max(percentage, 2)}%` }}
            >
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse rounded-full"></div>

              {/* Particules flottantes */}
              <div className="absolute top-1 left-2 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
              <div className="absolute top-2 right-4 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>

          {/* Indicateur de pourcentage flottant */}
          {percentage > 20 && (
            <div
              className="absolute -top-2 h-8 flex items-center transition-all duration-1500 ease-out"
              style={{ left: `${Math.min(percentage - 10, 75)}%` }}
            >
              <div className="bg-white text-sm font-bold text-gray-700 px-4 py-2 rounded-full shadow-xl border border-gray-200 transform -translate-y-2">
                {percentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-100">
            <div className="text-lg font-bold text-blue-600">{voteCount}</div>
            <div className="text-xs text-blue-500 font-medium">Votes</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center border border-green-100">
            <div className="text-lg font-bold text-green-600">{percentage.toFixed(1)}%</div>
            <div className="text-xs text-green-500 font-medium">Part</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border border-purple-100">
            <div className="text-lg font-bold text-purple-600">#{index + 1}</div>
            <div className="text-xs text-purple-500 font-medium">Rang</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoizedCandidateBar = memo(CandidateBar);

const ResultsChart: React.FC<ResultsChartProps> = ({ electionId, isElectionEnded = false }) => {
  const parsedElectionId = typeof electionId === 'string' ? parseInt(electionId, 10) : electionId;

  const { data: candidatesData, loading } = useQuery(GET_CANDIDATES_BY_ELECTION_ID, {
    variables: { electionId: parsedElectionId },
    pollInterval: 2000,
    skip: !parsedElectionId,
  });

  const candidates = candidatesData?.candidatesByElection || [];

  const { sortedCandidates, winner, totalVotes } = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => {
      const aVotes = a.vote_count || a.voteCount || 0;
      const bVotes = b.vote_count || b.voteCount || 0;
      return bVotes - aVotes;
    });

    const total: number = candidates.reduce((sum: number, candidate: Candidate) => {
      const voteCount: number = candidate.voteCount || 0;
      return sum + voteCount;
    }, 0);

    return {
      sortedCandidates: sorted,
      winner: sorted[0],
      totalVotes: total
    };
  }, [candidates]);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-white/40 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chargement des résultats</h3>
            <p className="text-gray-600">Synchronisation en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (totalVotes === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-white/40 shadow-xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Résultats</h3>
              <p className="text-gray-600 font-medium">En attente des premiers votes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-6 py-3 rounded-full border border-amber-200 shadow-lg">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">En attente</span>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl w-fit mx-auto mb-8 shadow-lg">
            <BarChart3 className="mx-auto text-gray-400" size={80} />
          </div>
          <h4 className="text-2xl font-bold text-gray-700 mb-4">Aucun vote pour le moment</h4>
          <p className="text-gray-500 text-lg">Les résultats s'afficheront dès les premiers votes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl">
      {/* Header avec design premium */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
              {isElectionEnded ? 'Résultats Finaux' : 'Résultats Live'}
            </h3>
            <p className="text-gray-600 font-medium text-lg">Classement en temps réel</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-6 py-4 rounded-2xl border border-green-200 shadow-lg">
          <Activity className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-lg">LIVE</span>
        </div>
      </div>

      {/* Banner de victoire si élection terminée */}
      {isElectionEnded && winner && <WinnerBanner winner={winner} totalVotes={totalVotes} />}

      {/* Liste des candidats */}
      <div className="space-y-8">
        {sortedCandidates.map((candidate, index) => (
          <MemoizedCandidateBar
            key={candidate.id}
            candidate={candidate}
            totalVotes={totalVotes}
            index={index}
          />
        ))}
      </div>

      {/* Statistiques globales premium */}
      <div className="mt-12 pt-10 border-t border-gray-200">
        <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center">Statistiques Globales</h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 rounded-3xl p-8 border border-blue-200 shadow-lg text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold text-blue-600 mb-3">{totalVotes.toLocaleString()}</div>
            <div className="text-blue-700 font-semibold">Total Votes</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-3xl p-8 border border-green-200 shadow-lg text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold text-green-600 mb-3">{candidates.length}</div>
            <div className="text-green-700 font-semibold">Candidats</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 rounded-3xl p-8 border border-purple-200 shadow-lg text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold text-purple-600 mb-3">
              {winner ? (((winner.vote_count || winner.voteCount || 0) / totalVotes) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-purple-700 font-semibold">Score Leader</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 rounded-3xl p-8 border border-amber-200 shadow-lg text-center group hover:scale-105 transition-transform duration-300">
            <div className="text-4xl font-bold text-amber-600 mb-3">
              {sortedCandidates.length > 1 ?
                Math.abs(((sortedCandidates[0]?.vote_count || sortedCandidates[0]?.voteCount || 0) -
                  (sortedCandidates[1]?.vote_count || sortedCandidates[1]?.voteCount || 0)) / totalVotes * 100).toFixed(1)
                : 0}%
            </div>
            <div className="text-amber-700 font-semibold">Écart</div>
          </div>
        </div>
      </div>

      {/* Indicateur de mise à jour premium */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 text-gray-700 px-8 py-4 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <span className="font-bold">Synchronisation automatique • 2 secondes</span>
        </div>
      </div>
    </div>
  );
};

export default memo(ResultsChart);