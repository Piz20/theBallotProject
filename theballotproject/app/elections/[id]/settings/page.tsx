"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import ElectionForm from "@/components/election-settings/election/election-form";
import NavigationTabs from "@/components/election-settings/navigation-tabs";
import CandidatesSection from "@/components/election-settings/candidates/candidates-selection";
import Footer from "@/components/ui/footer";
import { Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Tab = "general" | "candidates";

const ElectionEditPage: React.FC = () => {
  const { id } = useParams();
  const idValue = typeof id === "string" ? parseInt(id, 10) : undefined;

  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <>
      <title>Edit Election - TheBallotProject</title>

      <div className="flex items-center justify-between mb-8 mx-auto px-4 py-8">
        <div className="flex items-center gap-2">
          <Vote className="h-8 w-8 text-primary heartbeat" />
          <h1 className="text-3xl font-bold">TheBallotProject</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/elections">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-8 mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold">Edit Election</h1>
      </div>

      <div className="w-full max-w-3xl mx-auto mb-6">
        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {activeTab === "general" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <h2 className="text-2xl font-bold">Modify the Election</h2>
              <p className="opacity-90 mt-1">
                Customize the details of your election
              </p>
            </div>
            <div className="p-6">
              {/* Pass only the electionId */}
              {typeof idValue === "number" && (
                <ElectionForm electionId={idValue} />
              )}
            </div>
          </div>
        )}

        {activeTab === "candidates" && typeof idValue === "number" && (
          <CandidatesSection electionId={idValue} />
        )}
      </div>

      <Footer />
    </>
  );
};

export default ElectionEditPage;
