"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Calendar, Clock, Info, Save } from "lucide-react";
import { Election } from "@/interfaces/interfaces";
import ImageUploadSection from "@/components/election-settings/election/election-settings/image-upload-selection";
import { isStartDateBeforeEndDate, formatDateTimeForInput } from "@/lib/utils";
import LoadingState from "@/components/election-settings/election/election-settings/loading-state";
import ErrorState from "@/components/election-settings/election/election-settings/error-state";
import { GET_ELECTION_BY_ID, UPDATE_ELECTION } from "@/lib/mutations/electionMutations";

interface ElectionFormProps {
  electionId: number;
  onSave?: () => void; // optional callback when save is done

}

const ElectionForm: React.FC<ElectionFormProps> = ({ electionId, onSave }) => {
  const { data, loading, error, refetch } = useQuery(GET_ELECTION_BY_ID, {
    variables: { id: electionId },
  });

  const [updateElection, { loading: saving }] = useMutation(UPDATE_ELECTION);

  const [formState, setFormState] = useState<Election | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load data into form state when data arrives
  useEffect(() => {
    if (data?.election) {
      setFormState(data.election);
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
    setFormState(prev => prev ? { ...prev, [name]: value } : prev);
    setIsDirty(true);
    if (errors[name]) {
      setErrors(prev => {
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

  const validateForm = (): boolean => {
    if (!formState) return false;

    const newErrors: { [key: string]: string } = {};
    if (!formState.name?.trim()) {
      newErrors.name = "Election name is required";
    }
    if (formState.startDate && formState.endDate) {
      if (!isStartDateBeforeEndDate(formState.startDate, formState.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !formState) return;

    try {
      

      await updateElection({
        variables: {
          id: Number(formState.id),
          name: formState.name,
          description: formState.description,
          startDate: formState.startDate,
          endDate: formState.endDate,
          status: formState.status,
          eligibleEmails: formState.eligibleEmails,
          imageUrl: formState.imageUrl,
          imageFile : formState.imageFile,
        },
      });

      alert("Election updated successfully!");
      setIsDirty(false);
      await refetch();

      if (onSave) onSave();  // <-- ici on appelle le callback

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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
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
            value={formState.startDate ? formatDateTimeForInput(formState.startDate) : ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
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
            value={formState.endDate ? formatDateTimeForInput(formState.endDate) : ""}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.endDate ? "border-red-300 bg-red-50" : "border-gray-300"
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
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!isDirty ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
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
