"use client";
import React, { useState, useEffect } from 'react';
import Timer from '@/components/election-settings/election/election-details/timer';
import ResultsChart from '@/components/election-settings/election/election-details/result-charts';
import CandidateCard from '@/components/election-settings/election/election-details/candidate-card';
import { Vote, Users, BarChart3, RotateCcw, ArrowLeft } from 'lucide-react';
import { Candidate, Election } from '@/interfaces/interfaces';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ELECTION_BY_ID } from '@/lib/mutations/electionMutations';
import { GET_CANDIDATES_BY_ELECTION_ID } from '@/lib/mutations/candidateMutations';

import {
    CREATE_OR_UPDATE_VOTE,
    DELETE_VOTE,
    GET_USER_VOTE_IN_ELECTION
} from '@/lib/mutations/voteMuattions';

import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';

const ElectionVotingPage = () => {
    const { id } = useParams();
    const electionId = typeof id === 'string' ? parseInt(id, 10) : undefined;

    // Queries
    const { data, loading, error } = useQuery<{ election: Election }>(GET_ELECTION_BY_ID, {
        variables: { id: electionId },
        skip: !electionId,
    });

    const { data: candidateData, loading: candidatesLoading, error: candidatesError } = useQuery<{
        candidatesByElection: Candidate[];
    }>(GET_CANDIDATES_BY_ELECTION_ID, {
        variables: { electionId },
        skip: !electionId,
    });

    // Nouvelle requête pour récupérer le vote existant de l'utilisateur
    const { data: userVoteData, loading: userVoteLoading } = useQuery(GET_USER_VOTE_IN_ELECTION, {
        variables: { electionId },
        skip: !electionId,
        fetchPolicy: 'cache-and-network', // Pour s'assurer d'avoir les données les plus récentes
    });

    // Mutations
    const [createOrUpdateVote] = useMutation(CREATE_OR_UPDATE_VOTE);
    const [deleteVote] = useMutation(DELETE_VOTE);

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState<number | null>(null);
    const [userVoteId, setUserVoteId] = useState<number | string | null>(null);

    const [isElectionEnded, setIsElectionEnded] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);

    // Initialiser les candidats
    useEffect(() => {
        if (candidateData?.candidatesByElection) {
            setCandidates(candidateData.candidatesByElection);
            // Calcul totalVotes initial
            const total = candidateData.candidatesByElection.reduce(
                (acc, c) => acc + (c.vote_count ?? 0),
                0
            );
            setTotalVotes(total);
        }
    }, [candidateData]);

    // Initialiser l'état du vote existant
    useEffect(() => {
        if (userVoteData?.userVoteInElection) {
            const existingVote = userVoteData.userVoteInElection;
            setHasVoted(true);
            setVotedFor(existingVote.candidate.id);
            setUserVoteId(existingVote.id);
            console.log('Vote existant trouvé:', existingVote);
        } else {
            // Réinitialiser si aucun vote trouvé
            setHasVoted(false);
            setVotedFor(null);
            setUserVoteId(null);
        }
    }, [userVoteData]);

    // Vérifier si l'élection est terminée
    useEffect(() => {
        if (data?.election?.endDate) {
            const endDate = new Date(data.election.endDate);
            const now = new Date();
            if (now > endDate) {
                setIsElectionEnded(true);
            }
        }
    }, [data?.election?.endDate]);

    const election = data?.election;
    const endDate = election?.endDate ? new Date(election.endDate) : new Date(Date.now() + 2 * 60 * 60 * 1000);

    const handleVote = async (candidateIdParam: number | string) => {
        if (isElectionEnded) return;

        const candidateId = typeof candidateIdParam === 'string' ? parseInt(candidateIdParam, 10) : candidateIdParam;

        // Si l'utilisateur clique sur le même candidat pour lequel il a déjà voté, ne rien faire
        if (isVotedFor(candidateId)) {
            console.log('Déjà voté pour ce candidat');
            return;
        }

        const previousCandidateId = votedFor;

        // Optimistic update
        setCandidates(prev => {
            const updated = prev.map(c => ({ ...c }));

            // Décrémenter l'ancien vote
            const previous = updated.find(c => c.id === previousCandidateId);
            if (hasVoted && previous && typeof previous.vote_count === 'number') {
                previous.vote_count = Math.max(0, previous.vote_count - 1);
            }

            // Incrémenter le nouveau vote
            const current = updated.find(c => c.id === candidateId);
            if (current) {
                current.vote_count = (current.vote_count || 0) + 1;
            }

            return updated;
        });

        // Ajouter au total des votes si c'est un premier vote
        if (!hasVoted) {
            setTotalVotes(prev => prev + 1);
        }

        // Mise à jour optimiste de l'état
        setHasVoted(true);
        setVotedFor(candidateId);

        try {
            const { data } = await createOrUpdateVote({
                variables: {
                    candidateId,
                    electionId,
                },
            });

            if (data?.createOrUpdateVote.success) {
                setUserVoteId(data.createOrUpdateVote.vote?.id ?? null);
                console.log('Vote enregistré avec succès:', data.createOrUpdateVote.vote);
            } else {
                // Rollback si erreur côté serveur
                rollbackVote(candidateId, previousCandidateId);
                console.error('Erreur côté serveur :', data?.createOrUpdateVote.message);
            }
        } catch (error) {
            // Rollback si erreur réseau
            rollbackVote(candidateId, previousCandidateId);
            console.error('Erreur mutation vote :', error);
        }
    };

    // Fonction helper pour vérifier si un candidat est celui pour lequel l'utilisateur a voté
    const isVotedFor = (candidateId: number) => {
        return votedFor === candidateId;
    };

    // Rollback local de l'état des votes
    const rollbackVote = (newCandidateId: number, oldCandidateId: number | null) => {
        setCandidates(prev => {
            const updated = prev.map(c => ({ ...c }));

            const current = updated.find(c => c.id === newCandidateId);
            if (current && typeof current.vote_count === 'number') {
                current.vote_count = Math.max(0, current.vote_count - 1);
            }

            if (hasVoted && oldCandidateId !== null) {
                const previous = updated.find(c => c.id === oldCandidateId);
                if (previous) {
                    previous.vote_count = (previous.vote_count || 0) + 1;
                }
            }

            return updated;
        });

        if (!hasVoted) {
            setTotalVotes(prev => Math.max(0, prev - 1));
        }

        // Rollback de l'état du vote
        setHasVoted(oldCandidateId !== null);
        setVotedFor(oldCandidateId);
    };

    const handleCancelVote = async () => {
        if (!hasVoted || isElectionEnded || votedFor === null || userVoteId === null) return;

        const candidateId = votedFor;
        const voteId = typeof userVoteId === 'string' ? parseInt(userVoteId, 10) : userVoteId;

        // Optimistic update
        setCandidates(prev => {
            const updated = prev.map(c => ({ ...c }));
            const candidate = updated.find(c => c.id === candidateId);
            if (candidate && candidate.vote_count !== undefined) {
                candidate.vote_count = Math.max(0, candidate.vote_count - 1);
            }
            return updated;
        });

        setHasVoted(false);
        setVotedFor(null);
        setUserVoteId(null);
        setTotalVotes(prev => Math.max(0, prev - 1));

        try {
            const { data } = await deleteVote({
                variables: { voteId },
            });

            if (!data?.deleteVote.success) {
                console.error('Erreur lors de la suppression du vote:', data?.deleteVote.message);
                rollbackCancelVote(candidateId);
            } else {
                console.log('Vote annulé avec succès');
            }
        } catch (err) {
            console.error('Erreur mutation suppression vote:', err);
            rollbackCancelVote(candidateId);
        }
    };

    // Rollback local si la suppression échoue
    const rollbackCancelVote = (candidateId: number) => {
        setCandidates(prev => {
            const updated = prev.map(c => ({ ...c }));
            const candidate = updated.find(c => c.id === candidateId);
            if (candidate) {
                candidate.vote_count = (candidate.vote_count || 0) + 1;
            }
            return updated;
        });

        setHasVoted(true);
        setVotedFor(candidateId);
        setTotalVotes(prev => prev + 1);
    };

    const handleElectionEnd = () => setIsElectionEnded(true);

    if (loading || userVoteLoading) return <div className="p-8 text-center"><Loader /></div>;
    if (error || !election) return <div className="p-8 text-center text-red-500">Erreur lors du chargement de l'élection</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <Vote className="h-8 w-8 text-primary heartbeat" />
                        <h1 className="text-3xl font-bold">TheBallotProject</h1>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/elections">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Retour au tableau de bord
                        </Link>
                    </Button>
                </div>
                
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Election Title */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Vote className="text-blue-600 mr-3" size={36} />
                            <h1 className="text-4xl font-bold text-gray-800">{election.name}</h1>
                        </div>
                        <p className="text-gray-600 text-lg">{election.description}</p>
                    </div>

                    {/* Timer */}
                    <Timer endTime={endDate} onElectionEnd={handleElectionEnd} />

                    <div className="grid lg:grid-cols-3 gap-8 mt-8">
                        {/* Candidates Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Users className="text-gray-700 mr-2" size={24} />
                                    <h2 className="text-2xl font-bold text-gray-800">Candidats</h2>
                                </div>
                                
                                {hasVoted && !isElectionEnded && (
                                    <button
                                        onClick={handleCancelVote}
                                        className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <RotateCcw size={18} />
                                        <span>Annuler mon vote</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {candidates.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onVote={handleVote}
                                        hasVoted={hasVoted}
                                        votedFor={votedFor}
                                        totalVotes={totalVotes}
                                        isElectionEnded={isElectionEnded}
                                    />
                                ))}
                            </div>

                            {hasVoted && !isElectionEnded && (
                                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <div className="text-green-600 font-semibold">✅ Votre vote a été enregistré avec succès !</div>
                                    <div className="text-green-500 text-sm mt-1">
                                        Vous pouvez encore changer d'avis en annulant votre vote ou en votant pour un autre candidat.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results Section */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center mb-6">
                                <BarChart3 className="text-gray-700 mr-2" size={24} />
                                <h2 className="text-2xl font-bold text-gray-800">Résultats</h2>
                            </div>
                            <ResultsChart candidates={candidates} totalVotes={totalVotes} isElectionEnded={isElectionEnded} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ElectionVotingPage;