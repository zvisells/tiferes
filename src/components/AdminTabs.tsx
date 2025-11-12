'use client';

import React from 'react';

interface AdminTabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="flex flex-row gap-2 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 font-semibold flex flex-row items-center gap-2 whitespace-nowrap transition ${
            activeTab === tab.id
              ? 'text-custom-accent border-b-2 border-custom-accent'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

