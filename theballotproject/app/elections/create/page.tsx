"use client";

import { useState, useEffect } from "react";
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
  Settings,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";

const electionSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  description: z.string().min(20, { message: "La description doit contenir au moins 20 caractères" }),
  startDate: z.date(),
  endDate: z.date(),
  maxParticipants: z.number().min(2, { message: "Il faut au moins 2 participants" }),
});

type ElectionFormValues = z.infer<typeof electionSchema>;

export default function CreateElectionPage() {
  const [step, setStep] = useState(1);
  
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: "",
      description: "",
      maxParticipants: 2,
    },
  });

  const onSubmit = (data: ElectionFormValues) => {
    console.log(data);
    // Implémenter la logique de création d'élection ici
  };

 


  return (
    <>
    <title>TheBallotProject - Create an Election"</title>
    

    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
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

        {/* Étapes */}
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
              <Settings className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Créer une nouvelle élection</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour créer une nouvelle élection
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Date de début</Label>
                        <DatePicker />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Date de fin</Label>
                        <DatePicker />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maxParticipants">Nombre maximum de participants</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="maxParticipants"
                        type="number"
                        min={2}
                        {...form.register("maxParticipants", { valueAsNumber: true })}
                      />
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    {form.formState.errors.maxParticipants && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.maxParticipants.message}
                      </p>
                    )}
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
                {step < 3 ? (
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
    </div>

</>  );
}

