"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { ArrowLeft, Vote } from "lucide-react";
import ElectionForm from "@/components/election/election-form";
import LoadingState from "@/components/election/loading-state";
import ErrorState from "@/components/election/error-state";
import { Election } from "@/interfaces/interfaces";
import { GET_ELECTION_BY_ID, UPDATE_ELECTION } from "@/lib/mutations/electionMutations";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const ElectionEditPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const idValue = typeof id === "string" ? parseInt(id, 10) : undefined;

  const { data, loading, error } = useQuery(GET_ELECTION_BY_ID, {
    variables: { id: idValue },
    skip: !idValue || isNaN(idValue),
    onError: (err) => {
      console.error("Erreur lors du fetch de l'élection:", err);
    },
  });

  const [updateElection] = useMutation(UPDATE_ELECTION);
  const [saving, setSaving] = useState(false);

  const election: Election | null = data?.election ?? null;

  const formatDateToISO = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const handleSave = async (updated: Partial<Election>) => {
    if (!election) return;

    try {
      setSaving(true);

      const variables: any = {
        id: Number(election.id),
        name: updated.name ?? election.name,
        description: updated.description ?? election.description,
        startDate: formatDateToISO(updated.startDate ?? election.startDate),
        endDate: formatDateToISO(updated.endDate ?? election.endDate),
        status: updated.status ?? election.status,
        eligibleEmails: updated.eligibleEmails ?? election.eligibleEmails,
      };

      if (updated.imageFile && (updated.imageFile as any) instanceof File) {
        const base64 = await convertToBase64(updated.imageFile as unknown as File);
        variables.imageFile = base64;
        variables.imageUrl = null;
      } else if (updated.imageUrl) {
        variables.imageUrl = updated.imageUrl;
        variables.imageFile = null;
      }

      await updateElection({ variables });

      alert("Élection mise à jour avec succès !");
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={`Erreur de chargement : ${error.message}`} />;
  if (!election) return <ErrorState error="Aucune élection trouvée avec cet identifiant." />;

  return (
    <>
  {/* Header avec marges latérales */}
  <div className="flex items-center justify-between mb-8 mx-auto px-4 py-8">
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

  {/* Contenu principal centré */}
  <div className="w-full max-w-3xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Modifier l'élection</h1>
        <p className="opacity-90 mt-1">Personnalisez les détails de votre élection</p>
      </div>
      <div className="p-6">
        <ElectionForm election={election} onSave={handleSave} isSaving={saving} />
      </div>
    </div>
  </div>

  {/* Footer pleine largeur sans marges */}
  <Footer />
</>

  );
};

export default ElectionEditPage;

const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
