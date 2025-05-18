"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { gql, useMutation } from "@apollo/client";
import { Vote, ArrowLeft, FileText, Image, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/toaster";
// Import de ta mutation depuis un autre fichier
import { CREATE_ELECTION } from "@/lib/mutations/electionMutations";
  
import { title } from "node:process";
import { useToastStore } from "@/hooks/useToastStore";

const electionSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  description: z
    .string()
    .min(10, { message: "La description doit contenir au moins 10 caractères" }),
  electionImage: z
    .object({
      type: z.enum(["file", "url"]),
      value: z.union([z.instanceof(File), z.string()]),
    })
    .optional(),
});

type ElectionFormValues = z.infer<typeof electionSchema>;

export default function CreateElectionPage() {
  const [step, setStep] = useState(1);
  const { addToast } = useToastStore();
  const router = useRouter();
  // Hook mutation Apollo
  const [createElection, { loading: mutationLoading, error: mutationError }] =
    useMutation(CREATE_ELECTION);
  
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      title: "",
      description: "",
      electionImage: undefined,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = form;

  const electionImage = watch("electionImage");

  const onNext = async () => {
    if (step === 1) {
      const ok = await trigger(["title", "description"]);
      if (ok) setStep(2);
    } else if (step === 2) {
      if (electionImage) {
        setStep(3);
      } else {
        setError("electionImage", {
          type: "required",
          message: "Une image est requise pour l’étape 2",
        });
      }
    }

    console.log("Étape actuelle :", step);
  };

  
  const onSubmit = async (data: ElectionFormValues) => {
  const variables: any = {
    name: data.title,
    description: data.description,
  };

  // Vérifier le type d'image (URL ou fichier)
  const { electionImage } = data;

  if (!electionImage) {
    addToast({ title: "Error", message: "Veuillez fournir une image.❌", variant: "error" });
    return;
  }

  // Cas pour l'URL
  if (electionImage.type === "url") {
    variables.imageUrl = electionImage.value;
  } 
  // Cas pour le fichier
  else if (electionImage.type === "file") {
    const file = electionImage.value as File;
    try {
      const base64Image = await convertToBase64(file);
      variables.imageFile = base64Image;
    } catch (err) {
      addToast({ title: "Error", message: "Erreur lors de la conversion en base64.❌", variant: "error" });
      console.error("Erreur lors de la conversion du fichier en base64", err);
      return;
    }
  } else {
    addToast({ title: "Error", message: "Type d'image invalide.❌", variant: "error" });
    return;
  }

  try {
    const result = await createElection({
      variables,
      context: { hasUpload: true },
    });

    if (result.data.createElection.success) {
      addToast({ title: "Success", message: "Élection créée avec succès !✅", variant: "success" });
      setTimeout(() => router.push("/elections"), 3000);
    } else {
      addToast({ title: "Error", message: result.data.createElection.message, variant: "error" });
    }
  } catch (err) {
    addToast({ title: "Error", message: "Erreur lors de la création de l'élection.❌", variant: "error" });
    console.error("Erreur mutation : ", err);
  }
};

// Fonction pour convertir un fichier en base64
const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <Toaster />
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

        {/* Barre de progression */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6">
            {[1, 2, 3].map((s) => {
              const Icon = s === 1 ? FileText : s === 2 ? Image : CheckCircle2;
              return (
                <div key={s} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors duration-300
                      ${step === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1.5 w-24 transition-colors duration-300 ${step > s ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={(e) => {
            if (step === 3) {
              handleSubmit(onSubmit)(e);
            } else {
              e.preventDefault(); // Empêche la soumission si ce n’est pas l’étape 3
            }
          }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          <Card className="shadow-lg animate-fadeIn">
            <CardHeader>
              <CardTitle>Créer une nouvelle élection</CardTitle>
              <CardDescription>
                {step === 1 && "Étape 1 : Informations de base"}
                {step === 2 && "Étape 2 : Image de l’élection"}
                {step === 3 && "Étape 3 : Récapitulatif & Création"}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-24rem)] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre de l’élection</Label>
                    <Input
                      id="title"
                      placeholder="Ex : Élection du Bureau Exécutif 2024"
                      {...register("title")}
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez l’objectif et le contexte…"
                      className="h-32 mt-1"
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label className="mb-2 block">Image de l’élection</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sélectionne une image ou colle une URL.
                  </p>
                  <ImageUploader
                    value={
                      electionImage
                        ? { type: electionImage.type, value: electionImage.value }
                        : undefined
                    }
                    onChange={(img) => {
                      if (img instanceof File) {
                        setValue("electionImage", { type: "file", value: img });
                      } else {
                        setValue("electionImage", img);
                      }
                    }}
                  />
                  {errors.electionImage && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.electionImage.message}
                    </p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-4">Récapitulatif</h3>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div>
                      <span className="font-medium">Titre :</span> {getValues("title") || "—"}
                    </div>
                    <div>
                      <span className="font-medium">Description :</span>{" "}
                      {getValues("description") || "—"}
                    </div>
                    <div>
                      <span className="font-medium">Image :</span>{" "}
                      {electionImage ? (
                        <img
                          src={
                            electionImage.type === "file"
                              ? URL.createObjectURL(electionImage.value as File)
                              : (electionImage.value as string)
                          }
                          alt="Prévisualisation"
                          className="mt-2 w-full h-auto max-h-60 object-contain rounded-md"
                        />
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  {mutationError && (
                    <p className="text-sm text-destructive">
                      Erreur serveur : {mutationError.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            {/* Navigation */}
            <div className="flex justify-between px-6 py-4">
              {step === 1 && (
                <Button
                  type="button"
                  onClick={onNext}
                  disabled={mutationLoading}
                >
                  Next
                </Button>
              )}

              {step === 2 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={mutationLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={onNext}
                    disabled={mutationLoading}
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={mutationLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutationLoading}
                  >
                    {mutationLoading ? "Création..." : "Créer l’élection"}
                  </Button>
                </>
              )}

            </div>
          </Card>
        </form>
      </div>
      <Footer />
    </div>
  );
}
