import React from 'react';
import { Settings, Users, VoteIcon } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: 'general' | 'candidates' | 'voters';
  onTabChange: (tab: 'general' | 'candidates' | 'voters') => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    {
      id: 'general' as const,
      label: 'General Information',
      icon: Settings
    },
    {
      id: 'candidates' as const,
      label: 'Candidates',
      icon: Users
    } ,
        {
      id: 'voters' as const,
      label: 'Voters',
      icon: VoteIcon
    }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8" role="tablist"> {/* Added role="tablist" */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab" // Added role="tab"
              aria-selected={isActive} // Added aria-selected
              tabIndex={isActive ? 0 : -1} // Improves keyboard navigation
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}