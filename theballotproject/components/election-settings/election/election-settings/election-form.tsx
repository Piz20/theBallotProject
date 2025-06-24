"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Calendar, Clock, Info, Save } from "lucide-react";
import ImageUploadSection from "@/components/election-settings/election/election-settings/image-upload-selection";
import LoadingState from "@/components/election-settings/election/election-settings/loading-state";
import ErrorState from "@/components/election-settings/election/election-settings/error-state";
import { GET_ELECTION_BY_ID, UPDATE_ELECTION } from "@/lib/mutations/electionMutations";

interface ElectionFormProps {
  electionId: number;
  onSave?: () => void;
}

/**
 * Convertit une date ISO UTC en format local pour input datetime-local (sans timezone).
 * Exemple: "2025-06-24T20:53:00+00:00" -> "2025-06-24T22:53" (si +2h de décalage local)
 */
function isoUTCToLocalDateTimeLocal(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convertit une date locale (string "YYYY-MM-DDTHH:mm") en ISO UTC avec secondes.
 * Exemple: "2025-06-24T22:53" -> "2025-06-24T20:53:00Z" si décalage local +2h.
 */
function localDateTimeLocalToISOUTC(localDateTime: string): string | null {
  if (!localDateTime) return null;

  const [datePart, timePart] = localDateTime.split("T");
  if (!datePart || !timePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(localDate.getTime())) return null;

  return localDate.toISOString().slice(0, 19) + "Z";
}

const ElectionForm: React.FC<ElectionFormProps> = ({ electionId, onSave }) => {
  const { data, loading, error, refetch } = useQuery(GET_ELECTION_BY_ID, {
    variables: { id: electionId },
  });

  const [updateElection, { loading: saving }] = useMutation(UPDATE_ELECTION);

  const [formState, setFormState] = useState<{
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    eligibleEmails: string[];
    imageUrl?: string | null;
    imageFile?: string | null;
    createdAt?: string; // Ajout de createdAt dans le state
  } | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.election) {
      const election = data.election;
      setFormState({
        id: election.id,
        name: election.name ?? "",
        description: election.description ?? "",
        startDate: election.startDate ? isoUTCToLocalDateTimeLocal(election.startDate) : "",
        endDate: election.endDate ? isoUTCToLocalDateTimeLocal(election.endDate) : "",
        status: election.status ?? "",
        eligibleEmails: election.eligibleEmails ?? [],
        imageUrl: election.imageUrl ?? null,
        imageFile: election.imageFile ?? null,
        createdAt: election.createdAt ? isoUTCToLocalDateTimeLocal(election.createdAt) : "", // Stockage createdAt local
      });
      setErrors({});
      setIsDirty(false);
    }
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={`Loading error: ${error.message}`} />;
  if (!formState) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => (prev ? { ...prev, [name]: value } : prev));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (imageType: "url" | "file", value: string) => {
    if (!formState) return;
    if (imageType === "url") {
      setFormState({ ...formState, imageUrl: value, imageFile: null });
    } else {
      setFormState({ ...formState, imageFile: value, imageUrl: null });
    }
    setIsDirty(true);
  };

  // Validation des champs + validation startDate >= createdAt
  const validateForm = (): boolean => {
    if (!formState) return false;

    const newErrors: { [key: string]: string } = {};
    if (!formState.name.trim()) {
      newErrors.name = "Election name is required";
    }

    if (formState.startDate && formState.endDate) {
      const startISO = localDateTimeLocalToISOUTC(formState.startDate);
      const endISO = localDateTimeLocalToISOUTC(formState.endDate);
      if (startISO && endISO && new Date(startISO) >= new Date(endISO)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (formState.startDate && formState.createdAt) {
      const startDateObj = new Date(localDateTimeLocalToISOUTC(formState.startDate) || "");
      const createdAtObj = new Date(localDateTimeLocalToISOUTC(formState.createdAt) || "");
      if (startDateObj < createdAtObj) {
        newErrors.startDate = "Start date cannot be earlier than the creation date of the election";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !formState) return;

    try {
      const startDateISO = localDateTimeLocalToISOUTC(formState.startDate);
      const endDateISO = localDateTimeLocalToISOUTC(formState.endDate);

      await updateElection({
        variables: {
          id: Number(formState.id),
          name: formState.name,
          description: formState.description,
          startDate: startDateISO,
          endDate: endDateISO,
          status: formState.status,
          eligibleEmails: formState.eligibleEmails,
          imageUrl: formState.imageUrl,
          imageFile: formState.imageFile,
        },
      });

      alert("Election updated successfully!");
      setIsDirty(false);
      await refetch();
      if (onSave) onSave();
    } catch (err) {
      console.error("Update error:", err);
      alert("Error while updating.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Election Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name || ""}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Enter the election name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <Info size={14} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formState.description || ""}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Describe the purpose and details of this election..."
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 flex items-center gap-1"
          >
            <Calendar size={16} />
            Start Date and Time
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formState.startDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.startDate ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <Info size={14} />
              {errors.startDate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 flex items-center gap-1"
          >
            <Clock size={16} />
            End Date and Time
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formState.endDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.endDate ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
              <Info size={14} />
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Image upload */}
      <div className="pt-2">
        <ImageUploadSection
          imageUrl={formState.imageUrl}
          imageFile={formState.imageFile as unknown as string}
          onChange={handleImageChange}
        />
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !isDirty
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ElectionForm;
