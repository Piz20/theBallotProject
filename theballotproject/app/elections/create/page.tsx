"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Vote,
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  Image,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EligibilitySelector } from "@/components/ui/eligibility-selector";
import { ImageUploader } from "@/components/ui/image-uploader";
import Footer from "@/components/ui/footer";

interface Candidate {
  id: string;
  name: string;
  email: string;
  department: string;
}

const electionSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  eligibleCandidates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      department: z.string()
    })
  ).optional(),
  electionImage: z.object({
    type: z.enum(["file", "url"]),
    value: z.union([z.instanceof(File), z.string()])
  }).optional()
});

type ElectionFormValues = z.infer<typeof electionSchema>;

export default function CreateElectionPage() {
  const [step, setStep] = useState(1);
  
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: "",
      description: "",
      eligibleCandidates: []
    },
  });

  const onSubmit = (data: ElectionFormValues) => {
    // Validate all fields before final submission
    const errors = Object.keys(form.formState.errors);
    if (errors.length > 0) {
      // Find the step with the first error and navigate to it
      if (errors.includes("title") || errors.includes("description")) {
        setStep(1);
      } else if (errors.includes("startDate") || errors.includes("endDate")) {
        setStep(2);
      } else if (errors.includes("eligibleCandidates")) {
        setStep(3);
      }
      return;
    }

    console.log("Form data:", data);
    // Implement the election creation logic here
  };

  const { setValue, watch } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const eligibleCandidates = watch("eligibleCandidates") || [];
  const electionImage = watch("electionImage");

  return (
    <>
    
        <title>TheBallotProject - Create an election</title>
    

      <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
        <div className="container mx-auto px-4 py-8">
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

          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                <FileText className="h-5 w-5" />
              </div>
              <div className={`h-1 w-16 ${
                step > 1 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                <Calendar className="h-5 w-5" />
              </div>
              <div className={`h-1 w-16 ${
                step > 2 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                <Users className="h-5 w-5" />
              </div>
              <div className={`h-1 w-16 ${
                step > 3 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 4 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                <Image className="h-5 w-5" />
              </div>
              <div className={`h-1 w-16 ${
                step > 4 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 5 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Créer une nouvelle élection</CardTitle>
              <CardDescription>
                {step === 1 && "Étape 1: Informations de base sur l'élection"}
                {step === 2 && "Étape 2: Période de l'élection"}
                {step === 3 && "Étape 3: Critères d'éligibilité des participants"}
                {step === 4 && "Étape 4: Image de l'élection"}
                {step === 5 && "Étape 5: Confirmation des informations"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre de l'élection</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Élection du Bureau Exécutif 2024"
                        {...form.register("title")}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez l'objectif et le contexte de cette élection..."
                        className="h-32"
                        {...form.register("description")}
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Période de l'élection</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Date et heure de début</Label>
                          <Input
                            type="datetime-local"
                            id="startDate"
                            {...form.register("startDate", {
                              setValueAs: (v) => v ? new Date(v) : undefined
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">Date et heure de fin</Label>
                          <Input
                            type="datetime-local"
                            id="endDate"
                            {...form.register("endDate", {
                              setValueAs: (v) => v ? new Date(v) : undefined
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Critères d'éligibilité</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Utilisez l'IA pour sélectionner les candidats éligibles à partir
                        de critères textuels.
                      </p>
                      <EligibilitySelector
                        value={eligibleCandidates}
                        onChange={(candidates) => {
                          setValue("eligibleCandidates", candidates);
                        }}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Image de l'élection</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choisissez une image représentative pour votre élection.
                      </p>
                      <ImageUploader
                        value={electionImage}
                        onChange={(image) => {
                          setValue("electionImage", image);
                        }}
                      />
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Récapitulatif de l'élection</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Informations générales</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Titre: {form.getValues("title") || "Non défini"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Description: {form.getValues("description") || "Non définie"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Période</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Début: {startDate ? new Date(startDate).toLocaleString() : "Non définie"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Fin: {endDate ? new Date(endDate).toLocaleString() : "Non définie"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Participants éligibles</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {eligibleCandidates.length} candidats sélectionnés
                          </p>
                        </div>
                        {electionImage && (
                          <div>
                            <h4 className="font-medium">Image</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {electionImage.type === "file" 
                                ? "Image importée depuis l'ordinateur" 
                                : "Image depuis une URL"}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-6">
                        Vous pourrez modifier tous ces paramètres après la création de l'élection.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Précédent
                    </Button>
                  )}
                  {step < 5 ? (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="ml-auto"
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto">
                      Créer l'élection
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
}