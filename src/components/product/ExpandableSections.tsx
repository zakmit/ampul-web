'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Section {
  id: string;
  title: string;
  content: string;
}

interface ExpandableSectionsProps {
  sections: Section[];
}

const expandEase: [number, number, number, number] = [0.25, 1, 0.5, 1];

export default function ExpandableSections({ sections }: ExpandableSectionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      {sections.map((section) => {
        const isExpanded = expandedSection === section.id;
        return (
          <div key={section.id} className="border-b border-gray-200">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between py-4 no-underline hover:text-gray-500 hover:underline cursor-pointer transition-colors"
            >
              <h3 className="text-xl lg:text-2xl font-bold italic">{section.title}</h3>
              <ChevronRight
                className={`transform transition-transform duration-300 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <m.div
                  key="content"
                  initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: expandEase }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-4 px-2 lg:pl-3 text-sm italic lg:text-base text-gray-600">
                    <p>{section.content}</p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
