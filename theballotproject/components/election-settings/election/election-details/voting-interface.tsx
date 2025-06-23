import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, Users, BarChart3, Vote, CheckCircle, Wifi, RefreshCw, Trash2, Activity, Sparkles } from 'lucide-react';
import { Candidate, Election } from '@/interfaces/interfaces';
import CountdownTimer from './countdown-timer';
import AIAnalysis from './ai-analysis';
import VoteGauges from './voting-gauges';
import CandidateCard from './candidate-card';
import ResultsChart from './result-charts';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


interface VotingInterfaceProps {
  election: Election;
  candidates: Candidate[];
  userVote?: number | null;
  onVote: (candidateId: number) => void;
  onDeleteVote?: () => void;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  election,
  candidates,
  userVote,
  onVote,
  onDeleteVote
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(userVote || null);
  const [isVoting, setIsVoting] = useState(false);
  const [votingCandidateId, setVotingCandidateId] = useState<number | null>(null);
  const [isDeletingVote, setIsDeletingVote] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setSelectedCandidate(userVote || null);
  }, [userVote]);

  const totalVotes = useMemo(() => {
    return candidates.reduce((sum, candidate) => {
      const voteCount = candidate.voteCount || 0;
      return sum + voteCount;
    }, 0);
  }, [candidates]);

  const handleVote = async (candidateId: number) => {
    setIsVoting(true);
    setVotingCandidateId(candidateId);

    try {
      await onVote(candidateId);
      setSelectedCandidate(candidateId);
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    } finally {
      setIsVoting(false);
      setVotingCandidateId(null);
    }
  };

  const handleDeleteVote = async () => {
    if (!onDeleteVote) return;

    setIsDeletingVote(true);
    setShowDeleteConfirm(false);

    try {
      await onDeleteVote();
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
    } finally {
      setIsDeletingVote(false);
    }
  };

  const getElectionStatus = () => {
    const now = new Date();
    const startDate = election.startDate ? new Date(election.startDate) : null;
    const endDate = election.endDate ? new Date(election.endDate) : null;

    if (startDate && now < startDate) return 'upcoming';
    if (endDate && now > endDate) return 'ended';
    return 'active';
  };

  const status = getElectionStatus();
  const hasVoted = !!userVote;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Full-width header without border */}
      <div className="w-full flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          <Vote className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-bold">TheBallotProject</h1>
        </div>

        {/* Right side */}
        <Button variant="ghost" asChild>
          <Link href="/elections" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Election information block */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium mb-4">
              <Activity className="w-4 h-4" />
              <span>Ongoing Election</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{election.name}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{election.description}</p>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6">
            <CountdownTimer
              startDate={election.startDate}
              endDate={election.endDate}
              status={status}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* You can fill this section with your statistic cards */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main column */}
          <div className="lg:col-span-3 space-y-8">
            <AIAnalysis candidates={candidates} totalVotes={totalVotes} />

            {/* Candidates block */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Vote className="w-6 h-6 text-blue-600" />
                  </div>
                  <span>Candidates</span>
                </h2>

                <div className="flex items-center space-x-4">
                  {hasVoted && (
                    <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Vote recorded</span>
                    </div>
                  )}

                  {hasVoted && status === "active" && onDeleteVote && (
                    <button
                      onClick={handleDeleteVote}
                      disabled={isDeletingVote}
                      className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">
                        {isDeletingVote ? "Deleting..." : "Delete vote"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    totalVotes={totalVotes}
                    isSelected={selectedCandidate === candidate.id}
                    hasVoted={hasVoted}
                    isVoting={isVoting && votingCandidateId === candidate.id}
                    onVote={handleVote}
                    canVote={status === "active"}
                  />
                ))}
              </div>
            </div>

            <ResultsChart electionId={election.id} isElectionEnded={status === "ended"} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <VoteGauges candidates={candidates} totalVotes={totalVotes} />
          </div>
        </div>
      </div>

      <Footer />
    </div>

  );

};

export default VotingInterface;