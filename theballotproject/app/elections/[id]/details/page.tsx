"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import Loader from "@/components/ui/loader";
import VotingInterface from "@/components/election-settings/election/election-details/voting-interface";
import {

  GET_ELECTION_BY_ID,

} from "@/lib/mutations/electionMutations"; // Assure-toi que tous tes mutations/queries sont bien exportés là

import { GET_CANDIDATES_BY_ELECTION_ID } from "@/lib/mutations/candidateMutations";

import {
  CREATE_OR_UPDATE_VOTE,
  DELETE_VOTE,
  GET_USER_VOTE_IN_ELECTION
} from "@/lib/mutations/voteMuatations";
import { parse } from "node:path";

const VotingApp: React.FC = () => {
  const { id } = useParams();
  const electionId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const {
    data: electionData,
    loading: electionLoading,
    error: electionError,
  } = useQuery(GET_ELECTION_BY_ID, {
    variables: { id: electionId },
    skip: !electionId || isNaN(electionId),
    pollInterval: 5000, // mise à jour toutes les 5 secondes
  });

  const {
    data: candidatesData,
    loading: candidatesLoading,
    refetch: refetchCandidates,
  } = useQuery(GET_CANDIDATES_BY_ELECTION_ID, {
    variables: { electionId },
    pollInterval: 5000,
    skip: !electionId || isNaN(electionId),
  });

  const {
    data: userVoteData,
    refetch: refetchUserVote,
  } = useQuery(GET_USER_VOTE_IN_ELECTION, {
    variables: { electionId },
    pollInterval: 5000,
    skip: !electionId || isNaN(electionId),
  });


  const [createOrUpdateVote] = useMutation(CREATE_OR_UPDATE_VOTE);
  const [deleteUserVoteInElection] = useMutation(DELETE_VOTE);

  const handleVote = async (candidateId: number | string) => {
    try {
      const parsedCandidateId = typeof candidateId === "string" ? parseInt(candidateId, 10) : candidateId;
      const parsedElectionId = electionId;

      const result = await createOrUpdateVote({
        variables: {
          candidateId: parsedCandidateId,
          electionId: parsedElectionId,
        },
      });

      if (result.data?.createOrUpdateVote?.success) {
        await Promise.all([refetchCandidates(), refetchUserVote()]);
      } else {
        console.error("Erreur lors du vote:", result.data?.createOrUpdateVote?.message);
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };


  const handleDeleteVote = async () => {
    try {
      const parsedVoteId = parseInt(
        userVoteData?.userVoteInElection?.id || "",
        10
      );

      if (isNaN(parsedVoteId)) {
        console.error("ID de vote invalide.");
        return;
      }

      const result = await deleteUserVoteInElection({
        variables: {
          voteId: parsedVoteId,
        },
      });

      const response = result.data?.deleteVote;

      if (response?.success) {
        await Promise.all([refetchCandidates(), refetchUserVote()]);
      } else {
        console.error(
          "Erreur lors de la suppression du vote :",
          response?.message || "Réponse du serveur invalide"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du vote :", error);
    }
  };



  if (electionLoading || candidatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Chargement de l'élection...</p>
        </div>
      </div>
    );
  }

  if (electionError || !electionData?.election) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-red-200">
          <div className="text-red-600 text-xl font-semibold mb-2">
            Erreur de chargement
          </div>
          <p className="text-gray-600">
            Impossible de charger les données de l'élection.
          </p>
          {electionError && (
            <p className="text-sm text-red-500 mt-2">
              {electionError.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!candidatesData?.candidatesByElection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-amber-200">
          <div className="text-amber-600 text-xl font-semibold mb-2">
            Aucun candidat
          </div>
          <p className="text-gray-600">
            Aucun candidat n'a été trouvé pour cette élection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <VotingInterface
      election={electionData.election}
      candidates={candidatesData.candidatesByElection}
      userVote={userVoteData?.userVoteInElection?.candidate?.id}
      onVote={handleVote}
      onDeleteVote={handleDeleteVote}
    />
  );
};

function App() {
  return <VotingApp />;
}

export default App;