"use client";

import React from "react";
import { Crown, Award, Medal, BarChart3 } from "lucide-react";
import { Candidate } from "@/interfaces/interfaces";

interface ResultsChartProps {
  candidates: Candidate[];
  totalVotes: number;
  isElectionEnded: boolean;
}

const ResultsChart: React.FC<ResultsChartProps> = ({
  candidates,
  totalVotes,
  isElectionEnded,
}) => {
  // Trier les candidats par nombre de votes décroissant
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)
  );

  const winner = sortedCandidates[0];

  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="text-yellow-500" size={20} />;
      case 1:
        return <Award className="text-gray-400" size={20} />;
      case 2:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  if (totalVotes === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Résultats en Temps Réel
        </h3>
        <div className="text-center text-gray-500 py-8">
          <BarChart3 className="mx-auto mb-2" size={48} />
          <p>Aucun vote enregistré pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {isElectionEnded ? "Résultats Finaux" : "Résultats en Temps Réel"}
      </h3>

      {isElectionEnded && winner && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg mb-6 text-center">
          <Crown className="mx-auto mb-2" size={32} />
          <h2 className="text-2xl font-bold">🎉 Félicitations !</h2>
          <p className="text-lg">{winner.name} remporte l&apos;élection !</p>
          <p className="text-sm opacity-90">
            {((winner.vote_count ?? 0) / totalVotes * 100).toFixed(1)}% des votes (
            {winner.vote_count}/{totalVotes})
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sortedCandidates.map((candidate, index) => {
          const votes = candidate.vote_count ?? 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

          return (
            <div key={candidate.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getIcon(index)}
                  {candidate.imageUrl && (
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.name ?? "Candidat"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium text-gray-700">{candidate.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-800">
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">({votes})</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out bg-indigo-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
                {percentage > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total des votes:</span>
          <span className="font-semibold">{totalVotes}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultsChart;
