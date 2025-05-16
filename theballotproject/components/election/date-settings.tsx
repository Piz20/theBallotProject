'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateSettingsProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

const DateSettings: React.FC<DateSettingsProps> = ({ startDate, endDate, onDateChange }) => {
  const [dateValues, setDateValues] = useState<{
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  } | null>(null);

  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string; general?: string }>({});

useEffect(() => {
  if (dateValues !== null) return; // Empêche la réinitialisation

  const now = new Date();
  const defaultStart = addDays(now, 3);
  const defaultEnd = addDays(now, 10);

  const initialValues = {
    startDate: format(defaultStart, 'yyyy-MM-dd'),
    startTime: format(defaultStart, 'HH:mm'),
    endDate: format(defaultEnd, 'yyyy-MM-dd'),
    endTime: format(defaultEnd, 'HH:mm'),
  };

  setDateValues(initialValues);
  onDateChange(defaultStart, defaultEnd);
}, [dateValues]);

  const validateAndUpdate = useCallback((newVals: NonNullable<typeof dateValues>) => {
    const errs: typeof errors = {};

    try {
      const newStart = new Date(`${newVals.startDate}T${newVals.startTime}:00`);
      const newEnd = new Date(`${newVals.endDate}T${newVals.endTime}:00`);

      if (isBefore(newStart, new Date())) {
        errs.startDate = "La date de début ne peut pas être dans le passé";
      }

      if (!isBefore(newStart, newEnd)) {
        errs.endDate = "La date de fin doit être postérieure à la date de début";
      }

      if (Object.keys(errs).length === 0) {
        onDateChange(newStart, newEnd);
      }
    } catch {
      errs.general = "Format de date ou d'heure invalide";
    }

    setErrors(errs);
    setDateValues(newVals);
  }, [onDateChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dateValues) return;
    const { name, value } = e.target;
    const newValues = { ...dateValues, [name]: value };
    validateAndUpdate(newValues);
  };

  const formatDateForDisplay = (d: string, t: string) => {
    try {
      const date = new Date(`${d}T${t}:00`);
      return format(date, 'PPPp', { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  if (!dateValues) return null; // Empêche le rendu SSR jusqu'à init côté client

  const now = new Date();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Période de l'élection</h2>
        <p className="text-gray-600 mb-6">
          Définissez la période pendant laquelle les électeurs pourront voter. En dehors de cette période, 
          le vote ne sera pas accessible.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date de début */}
        <div className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center text-gray-700 mb-2">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="font-medium">Date de début</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateValues.startDate}
                onChange={handleChange}
                min={format(now, 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <div className="flex items-center">
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={dateValues.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Clock className="ml-2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            {errors.startDate && (
              <div className="text-sm text-red-600 mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.startDate}
              </div>
            )}
          </div>
        </div>

        {/* Date de fin */}
        <div className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center text-gray-700 mb-2">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="font-medium">Date de fin</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateValues.endDate}
                onChange={handleChange}
                min={dateValues.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <div className="flex items-center">
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={dateValues.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Clock className="ml-2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            {errors.endDate && (
              <div className="text-sm text-red-600 mt-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.endDate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-3">Récapitulatif</h3>
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="w-32 text-sm font-medium text-gray-500">Début:</div>
            <div className="text-gray-800">{formatDateForDisplay(dateValues.startDate, dateValues.startTime)}</div>
          </div>
          <div className="flex items-start">
            <div className="w-32 text-sm font-medium text-gray-500">Fin:</div>
            <div className="text-gray-800">{formatDateForDisplay(dateValues.endDate, dateValues.endTime)}</div>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center mt-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {errors.general}
        </div>
      )}
    </div>
  );
};

export default DateSettings;
