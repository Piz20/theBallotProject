import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Info, Save } from 'lucide-react';
import { Election } from '@/interfaces/interfaces';
import ImageUploadSection from '@/components/election/image-upload-selection';
import { isStartDateBeforeEndDate, formatDateTimeForInput } from '@/lib/utils';

interface ElectionFormProps {
  election: Election;
  onSave: (updatedElection: Election) => Promise<void>;
  isSaving: boolean;
}

const ElectionForm: React.FC<ElectionFormProps> = ({ 
  election, 
  onSave, 
  isSaving 
}) => {
  const [formState, setFormState] = useState<Election>(election);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Reset form when election changes
  useEffect(() => {
    setFormState(election);
    setIsDirty(false);
    setErrors({});
  }, [election]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (imageType: 'url' | 'file', value: string) => {
    if (imageType === 'url') {
      setFormState(prev => ({ 
        ...prev, 
        imageUrl: value, 
        imageFile: null 
      }));
    } else {
      setFormState(prev => ({ 
        ...prev, 
        imageFile: value, 
        imageUrl: null 
      }));
    }
    setIsDirty(true);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate name
    if (!formState.name?.trim()) {
      newErrors.name = "Le nom de l'élection est requis";
    }
    
    // Validate dates
    if (formState.startDate && formState.endDate) {
      if (!isStartDateBeforeEndDate(formState.startDate, formState.endDate)) {
        newErrors.endDate = "La date de fin doit être postérieure à la date de début";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onSave(formState);
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom de l'élection
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formState.name || ''}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Entrez le nom de l'élection"
        />
        {errors.name && (
          <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
            <Info size={14} />
            {errors.name}
          </p>
        )}
      </div>
      
      {/* Description field */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formState.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Décrivez le but et les détails de cette élection..."
        ></textarea>
      </div>
      
      {/* Date fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Calendar size={16} />
            Date et heure de début
          </label>
          <input
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={formState.startDate ? formatDateTimeForInput(formState.startDate) : ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Clock size={16} />
            Date et heure de fin
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={formState.endDate ? formatDateTimeForInput(formState.endDate) : ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
      
      {/* Image upload section */}
      <div className="pt-2">
        <ImageUploadSection 
          imageUrl={formState.imageUrl}
          imageFile={formState.imageFile}
          onChange={handleImageChange}
        />
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={!isDirty || isSaving}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${!isDirty ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
          `}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={18} />
              Enregistrer les modifications
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ElectionForm;