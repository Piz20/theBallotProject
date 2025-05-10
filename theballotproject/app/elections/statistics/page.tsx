"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Vote, 
  ArrowLeft,
  LineChart,
  BarChart,
  PieChart,
  Brain,
  Loader2,
  X,
  Download,
  FileText,
  Table
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/ui/footer";

export default function StatisticsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeChart, setIncludeChart] = useState(true);
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation d'une requête API (à remplacer par l'appel réel à Gemini)
    setTimeout(() => {
      setResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Réponse IA</title>
          </head>
          <body>
            <h2>Analyse des élections</h2>
            <p>Voici une simulation de réponse...</p>
          </body>
        </html>
      `);
      setLoading(false);
    }, 2000);
  };

  const handleDownload = (format: 'pdf' | 'excel') => {
    // Simulation du téléchargement (à implémenter)
    console.log(`Téléchargement au format ${format}`);
  };

  return (
    <>
          <title>TheBallotProject - Statistics and Analysis</title>

    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <div className="container max-w-[95%] mx-auto px-6 py-8">
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

        {/* Carte principale */}
        <Card className="w-full bg-card/80 backdrop-blur-md border-border/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6 text-primary" />
              Assistant IA pour l'analyse des élections
            </CardTitle>
            <CardDescription>
              Posez vos questions sur les statistiques des élections et obtenez des analyses détaillées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Zone de saisie */}
              <div className="space-y-2">
                <Label htmlFor="query">Votre question</Label>
                <div className="relative">
                  <Input
                    id="query"
                    placeholder="Ex: Montre-moi l'évolution du taux de participation sur les 3 dernières élections..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-4 pr-10 py-6 text-lg"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-chart"
                      checked={includeChart}
                      onCheckedChange={setIncludeChart}
                    />
                    <Label htmlFor="include-chart">Inclure des graphiques</Label>
                  </div>
                  {includeChart && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <BarChart className="h-4 w-4" />
                      <LineChart className="h-4 w-4" />
                      <PieChart className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    "Analyser"
                  )}
                </Button>
              </div>

              {/* Zone de réponse */}
              {response && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Résultats de l'analyse</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Format PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload('excel')}>
                          <Table className="mr-2 h-4 w-4" />
                          Format Excel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="w-full min-h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
                    <iframe
                      srcDoc={response}
                      className="w-full h-full min-h-[400px] border-0"
                      style={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto"
                      }}
                    />
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Suggestions de questions */}
        <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            onClick={() => setQuery("Quel est le taux de participation moyen des élections de cette année ?")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Question suggérée</CardTitle>
              <CardDescription>
                Quel est le taux de participation moyen des élections de cette année ?
              </CardDescription>
            </CardHeader>
          </Card>
          <Card 
            className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            onClick={() => setQuery("Quelles sont les tendances de vote par catégorie d'âge ?")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Question suggérée</CardTitle>
              <CardDescription>
                Quelles sont les tendances de vote par catégorie d'âge ?
              </CardDescription>
            </CardHeader>
          </Card>
          <Card 
            className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
            onClick={() => setQuery("Compare les résultats des 3 dernières élections avec des graphiques")}
          >
            <CardHeader>
              <CardTitle className="text-sm">Question suggérée</CardTitle>
              <CardDescription>
                Compare les résultats des 3 dernières élections avec des graphiques
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <Footer/>
    </div>
    </>
  );
}