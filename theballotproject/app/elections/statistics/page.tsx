"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLazyQuery, gql } from "@apollo/client";

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
  Expand,
  Shrink,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/ui/footer";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const RUN_FOR_GRAPHS_AI_QUERY = gql`
  query RunForGraphsAIQuery($prompt: String!) {
    runForGraphs(prompt: $prompt)
  }
`;

export default function StatisticsPage() {
  const [query, setQuery] = useState("");
  const [includeChart, setIncludeChart] = useState(true);
  const [response, setResponse] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [getGraphData, { loading, data }] = useLazyQuery(RUN_FOR_GRAPHS_AI_QUERY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      alert("Merci de saisir une question.");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    const promptWithChart = includeChart
      ? `${query.trim()} (inclure des graphiques)`
      : `${query.trim()} (ne pas inclure de graphiques)`;

    getGraphData({
      variables: { prompt: promptWithChart },
      context: {
        fetchOptions: {
          signal: controller.signal,
        },
      },
    });

    setShowResult(true);
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setShowResult(false);
    }
  };

  useEffect(() => {
    if (data?.runForGraphs) {
      const rawHtml = data.runForGraphs;
      const d3Script = `<script src="https://d3js.org/d3.v7.min.js"></script>`;
      const injectedHtml = rawHtml.includes("https://d3js.org/d3")
        ? rawHtml
        : rawHtml.replace("</head>", `${d3Script}</head>`);
      setResponse(injectedHtml);
    }
  }, [data]);

  const handleDownloadPdf = () => {
    if (!response) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.srcdoc = response;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        import("html2pdf.js").then((html2pdf) => {
          html2pdf.default()
            .from(iframe.contentDocument?.body)
            .set({ filename: "resultat-analyse.pdf" })
            .save()
            .finally(() => {
              document.body.removeChild(iframe);
            });
        });
      }, 500);
    };
  };

  return (
    <>
      <title>TheBallotProject - Statistics and Analysis</title>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
        <div className="container max-w-[95%] mx-auto px-6 py-8">
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

          {/* Main Card */}
          <Card className="w-full bg-card/80 backdrop-blur-md border-border/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-primary" />
                Assistant IA pour l'analyse des élections
              </CardTitle>
              <CardDescription>
                Posez vos questions sur les statistiques des élections et obtenez
                des analyses détaillées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        aria-label="Effacer la saisie"
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
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        "Analyser"
                      )}
                    </Button>
                    {loading && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleCancel}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Résultats */}
          {showResult && (
            <div
              className={`mt-8 relative bg-white rounded-lg shadow-lg overflow-hidden ${isExpanded
                ? "fixed top-0 left-0 w-full h-full z-50 p-4"
                : "min-h-[400px]"
                }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Résultats de l'analyse</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Réduire la zone" : "Agrandir la zone"}
                    title={isExpanded ? "Réduire la zone" : "Agrandir la zone"}
                  >
                    {isExpanded ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    aria-label="Télécharger le PDF"
                    title="Télécharger le PDF"
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-5 w-5" />
                    <span>Télécharger PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResult(false)}
                    aria-label="Fermer la zone de résultats"
                    title="Fermer la zone de résultats"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <iframe
                srcDoc={response}
                className={`w-full h-full border-0 ${isExpanded ? "min-h-full" : "min-h-[400px]"}`}
                style={{
                  height: isExpanded ? "calc(100vh - 4rem)" : "400px",
                  width: "100%",
                  overflow: "auto",
                  borderRadius: "0.5rem",
                }}
                title="Résultats de l'analyse"
              />
            </div>
          )}

          {/* Suggestions */}
          <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Quel est le taux de participation moyen des élections de cette année ?",
              "Quelles sont les tendances de vote par catégorie d'âge ?",
              "Compare les résultats des 3 dernières élections avec des graphiques",
            ].map((q, i) => (
              <Card
                key={i}
                className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => setQuery(q)}
              >
                <CardHeader>
                  <CardTitle className="text-sm">Question suggérée</CardTitle>
                  <CardDescription>{q}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
