import React from 'react';
import { Calendar, ChevronRight, Users } from 'lucide-react';
import { Election } from '../../interfaces/interfaces';
import LazyImage from './lazy-image';

interface ElectionCardProps {
  election: Election;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election }) => {
  return (
    <div 
      className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-fadeIn"
    >
      <LazyImage src={election.imageUrl || ''} alt={election.name} />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            election.status === "Ongoing" ? "bg-green-100 text-green-800 animate-pulse" :
            election.status === "Upcoming" ? "bg-blue-100 text-blue-800 animate-pulse" :
            "bg-gray-100 text-gray-800"
          }`}>
            {election.status}
          </span>
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{election.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{election.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {Array.isArray(election.eligibleEmails) ? election.eligibleEmails.length : 0} eligible voters
            </span>
          </div>
          <button className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            View details
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Start: {new Date(election.startDate ?? '').toLocaleDateString()}</span>
            <span>End: {new Date(election.endDate ?? '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionCard;