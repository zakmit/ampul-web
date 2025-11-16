'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ExpandableSectionsProps {
  sections: Section[];
}

export default function ExpandableSections({ sections }: ExpandableSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        return (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full flex items-center justify-between py-4 no-underline hover:text-gray-500 hover:underline transition-colors ${
                isExpanded ? 'border-transparent' : 'border-b border-gray-200'
              }`}
            >
              <h3 className="text-xl lg:text-2xl font-bold italic">{section.title}</h3>
              <ChevronRight
                className={`transform transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            {isExpanded && (
              <div className="py-4 px-2 lg:pl-3 lg:pr-0 text-sm lg:text-base text-gray-600 border-b border-gray-200">
                <p>{section.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
