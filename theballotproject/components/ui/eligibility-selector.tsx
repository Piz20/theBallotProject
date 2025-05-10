"use client";

import * as React from "react";
import { Search, Loader2, UserCheck, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// This is a mock function that would be replaced by the actual API call to Gemini
const mockProcessWithAI = async (criteria: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Mock response with some candidates
  return [
    { id: "1", name: "Jean Dupont", email: "jean.dupont@example.com", department: "Marketing" },
    { id: "2", name: "Marie Martin", email: "marie.martin@example.com", department: "Finance" },
    { id: "3", name: "Pierre Bernard", email: "pierre.bernard@example.com", department: "IT" },
    { id: "4", name: "Sophie Petit", email: "sophie.petit@example.com", department: "HR" },
    { id: "5", name: "Lucas Dubois", email: "lucas.dubois@example.com", department: "Sales" },
  ];
};

interface Candidate {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface EligibilitySelectorProps {
  onChange: (candidates: Candidate[]) => void;
  value: Candidate[];
}

export function EligibilitySelector({ onChange, value }: EligibilitySelectorProps) {
  const [criteria, setCriteria] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCandidates, setSelectedCandidates] = React.useState<Candidate[]>(value || []);

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProcessCriteria = async () => {
    if (!criteria.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await mockProcessWithAI(criteria);
      setCandidates(result);
      // Auto-select all candidates
      setSelectedCandidates(result);
      onChange(result);
    } catch (error) {
      console.error("Error processing criteria:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCandidate = (candidate: Candidate) => {
    const isSelected = selectedCandidates.some((c) => c.id === candidate.id);
    
    let newSelectedCandidates;
    if (isSelected) {
      newSelectedCandidates = selectedCandidates.filter((c) => c.id !== candidate.id);
    } else {
      newSelectedCandidates = [...selectedCandidates, candidate];
    }
    
    setSelectedCandidates(newSelectedCandidates);
    onChange(newSelectedCandidates);
  };

  const selectAll = () => {
    setSelectedCandidates(candidates);
    onChange(candidates);
  };

  const deselectAll = () => {
    setSelectedCandidates([]);
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Décrivez les critères d'éligibilité pour cette élection (ex: employés du département marketing avec au moins 2 ans d'ancienneté)..."
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          className="h-24 resize-none"
        />
        <Button 
          onClick={handleProcessCriteria} 
          disabled={isProcessing || !criteria.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            "Trouver les candidats éligibles"
          )}
        </Button>
      </div>

      {candidates.length > 0 && (
        <Card className="border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                {selectedCandidates.length} candidats sélectionnés sur {candidates.length}
              </h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAll}
                  className="h-8 px-2 text-xs"
                >
                  <UserCheck className="mr-1 h-3 w-3" />
                  Tout sélectionner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={deselectAll}
                  className="h-8 px-2 text-xs"
                >
                  <UserMinus className="mr-1 h-3 w-3" />
                  Tout désélectionner
                </Button>
              </div>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un candidat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md transition-colors",
                      selectedCandidates.some((c) => c.id === candidate.id)
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        name={`candidate-${candidate.id}`}
                        control={null} // Replace `null` with the appropriate control if using a form library like React Hook Form
                        checked={selectedCandidates.some((c) => c.id === candidate.id)}
                        onCheckedChange={() => toggleCandidate(candidate)}
                        id={`candidate-${candidate.id}`}
                      />
                      <div>
                        <label
                          htmlFor={`candidate-${candidate.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {candidate.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {candidate.department}
                    </Badge>
                  </div>
                ))}
                
                {filteredCandidates.length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Aucun résultat pour "{searchQuery}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}