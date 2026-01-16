'use client';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'radio' | 'checkbox';
  options: FilterOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
}

interface ProductFiltersProps {
  sections: FilterSection[];
}

export default function ProductFilters({ sections }: ProductFiltersProps) {
  const handleRadioChange = (value: string, onChange?: (value: string | string[]) => void) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleCheckboxChange = (
    value: string,
    currentValues: string[],
    onChange?: (value: string | string[]) => void
  ) => {
    if (onChange) {
      if (currentValues.includes(value)) {
        onChange(currentValues.filter((v) => v !== value));
      } else {
        onChange([...currentValues, value]);
      }
    }
  };

  return (
    <div className="space-y-6 lg:space-y-6">
      {sections.map((section) => (
        <div key={section.id}>
          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
          <div className="space-y-3 ml-4">
            {section.type === 'radio' ? (
              // Radio buttons for single selection (e.g., Sort By)
              section.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => section.onChange && handleRadioChange(option.id, section.onChange)}
                  className={`text-sm text-left w-full hover:underline transition-all ${
                    section.value === option.id ? 'font-bold' : 'font-normal'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              // Checkboxes for multiple selection
              section.options.map((option) => {
                const currentValues = Array.isArray(section.value) ? section.value : [];
                return (
                  <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={option.id}
                      checked={currentValues.includes(option.id)}
                      onChange={() =>
                        section.onChange && handleCheckboxChange(option.id, currentValues, section.onChange)
                      }
                      className="w-4 h-4 accent-gray-900"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
