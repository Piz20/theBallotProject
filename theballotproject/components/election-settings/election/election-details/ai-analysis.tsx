import React from 'react';
import { Brain, TrendingUp, Users, BarChart3, Zap, Target, Activity, Sparkles, Cpu, PieChart, LineChart } from 'lucide-react';
import { Candidate } from '@/interfaces/interfaces';
import { GET_CANDIDATES_BY_ELECTION_ID } from '@/lib/mutations/candidateMutations';
import { useQuery } from '@apollo/client';
interface AIAnalysisProps {
  candidates: Candidate[];
  totalVotes: number;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ candidates, totalVotes }) => {


  const { data: candidatesData } = useQuery(GET_CANDIDATES_BY_ELECTION_ID, {
    variables: {
      electionId: candidates.length
        ? parseInt(String(candidates[0]?.election?.id), 10)
        : 1
    },
    pollInterval: 2000,
    skip: !candidates.length
  });


  const freshCandidates = candidatesData?.candidatesByElection || candidates;
  interface FreshCandidate {
    id: number | string;
    name: string;
    vote_count?: number;
    voteCount?: number;
    election?: {
      id: number | string;
    };
    [key: string]: any;
  }

  const freshTotalVotes: number = (freshCandidates as FreshCandidate[]).reduce((sum: number, candidate: FreshCandidate) => {
    const voteCount: number = candidate.vote_count ?? candidate.voteCount ?? 0;
    return sum + voteCount;
  }, 0);

  const getLeadingCandidate = () => {
    return (freshCandidates as FreshCandidate[]).reduce(
      (prev: FreshCandidate, current: FreshCandidate) => {
        const prevVotes: number = prev.vote_count || prev.voteCount || 0;
        const currentVotes: number = current.vote_count || current.voteCount || 0;
        return currentVotes > prevVotes ? current : prev;
      }
    );
  };

  const getVotePercentage = (votes: number) => {
    return freshTotalVotes > 0 ? ((votes / freshTotalVotes) * 100).toFixed(1) : '0.0';
  };

  const generateInsights = () => {
    const leader = getLeadingCandidate();
    const sortedCandidates = [...freshCandidates].sort((a, b) => {
      const aVotes = a.vote_count || a.voteCount || 0;
      const bVotes = b.vote_count || b.voteCount || 0;
      return bVotes - aVotes;
    });

    const leaderVotes = sortedCandidates[0]?.vote_count || sortedCandidates[0]?.voteCount || 0;
    const secondVotes = sortedCandidates[1]?.vote_count || sortedCandidates[1]?.voteCount || 0;

    const margin = freshTotalVotes > 0 ? ((leaderVotes - secondVotes) / freshTotalVotes * 100) : 0;
    const dominance = freshTotalVotes > 0 ? (leaderVotes / freshTotalVotes * 100) : 0;

    const competitiveness = margin < 5 ? 'Très serrée' : margin < 15 ? 'Compétitive' : 'Dominante';
    const winProbability = Math.min(95, Math.max(55, 50 + (margin * 2)));
    const confidence = margin > 15 ? 95 : margin > 5 ? 78 : 62;

    return {
      leader,
      margin: margin.toFixed(1),
      dominance: dominance.toFixed(1),
      competitiveness,
      isCloseRace: margin < 10,
      participation: freshTotalVotes,
      winProbability,
      confidence
    };
  };

  const insights = generateInsights();
  const leaderVotes = insights.leader.vote_count || insights.leader.voteCount || 0;

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Analysis</h3>
            <p className="text-gray-600 text-sm">Real-time predictions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
          <Activity className="w-4 h-4" />
          <span className="font-medium text-sm">AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prediction */}
        <div className="lg:col-span-2 bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Advanced Prediction</h4>

              <p className="text-gray-700 mb-4">
                <span className="font-bold text-purple-600">{insights.leader.name}</span> leads
                with <span className="font-bold text-lg text-purple-700">{getVotePercentage(leaderVotes)}%</span> of the votes
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 text-sm">Winning Probability</span>
                    <span className="text-lg font-bold text-purple-600">{insights.winProbability.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${insights.winProbability}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 text-sm">Confidence</span>
                    <span className="text-lg font-bold text-indigo-600">{insights.confidence}%</span>
                  </div>
                  <p className="text-gray-600 text-xs">Level of certainty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h5 className="font-bold text-gray-900">Trend</h5>
            </div>
            <div>
              <p className="text-blue-700 font-bold">{insights.competitiveness}</p>
              <p className="text-gray-600 text-sm">Race is {insights.competitiveness.toLowerCase()}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-5 h-5 text-green-600" />
              <h5 className="font-bold text-gray-900">Participation</h5>
            </div>
            <div>
              <p className="text-green-700 font-bold">
                {freshTotalVotes > 100 ? 'High' : freshTotalVotes > 50 ? 'Moderate' : 'Low'}
              </p>
              <p className="text-gray-600 text-sm">{freshTotalVotes} votes</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <h5 className="font-bold text-gray-900">Dominance</h5>
            </div>
            <div>
              <p className="text-amber-700 font-bold">{insights.dominance}%</p>
              <p className="text-gray-600 text-sm">Leader's score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 text-indigo-600 mt-1" />
            <div>
              <h5 className="font-bold text-gray-900 mb-2">Momentum</h5>
              <p className="text-gray-700 text-sm">
                {insights.isCloseRace
                  ? 'The race remains very close. Every vote counts.'
                  : `${insights.leader.name} is consolidating their lead.`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-pink-600 mt-1" />
            <div>
              <h5 className="font-bold text-gray-900 mb-2">Projection</h5>
              <p className="text-gray-700 text-sm">
                Confidence of <span className="font-bold text-pink-600">{insights.confidence}%</span>
                based on current trends.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-200">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-150"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-300"></div>
          </div>
          <Brain className="w-4 h-4" />
          <span className="font-medium text-sm">AI continuously analyzing</span>
        </div>
      </div>
    </div>

  );
};

export default AIAnalysis;