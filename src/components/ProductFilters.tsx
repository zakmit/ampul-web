'use client';

interface FilterOption {
  id: string;
  label: string;
}

interface ProductFiltersProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  volumeFilter: string[];
  setVolumeFilter: (value: string[]) => void;
  collectionFilter: string[];
  setCollectionFilter: (value: string[]) => void;
  fragranceNotesFilter: string[];
  setFragranceNotesFilter: (value: string[]) => void;
}

const sortOptions: FilterOption[] = [
  { id: 'default', label: 'Default' },
  { id: 'name-asc', label: 'Name A-Z' },
  { id: 'name-desc', label: 'Name Z-A' },
  { id: 'price-asc', label: 'Price from low to high' },
  { id: 'price-desc', label: 'Price from high to low' },
];

const volumeOptions: FilterOption[] = [
  { id: '100ml', label: '100 ml' },
];

const collectionOptions: FilterOption[] = [
  { id: 'greek-mythology', label: 'Greek Mythology' },
];

const fragranceNotesOptions: FilterOption[] = [
  { id: 'citrus', label: 'Citrus' },
  { id: 'floral', label: 'Floral' },
  { id: 'leather', label: 'Leather' },
];

export default function ProductFilters({
  sortBy,
  setSortBy,
  volumeFilter,
  setVolumeFilter,
  collectionFilter,
  setCollectionFilter,
  fragranceNotesFilter,
  setFragranceNotesFilter,
}: ProductFiltersProps) {
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleCheckboxChange = (
    value: string,
    currentValues: string[],
    setter: (value: string[]) => void
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-6">
      {/* Sort By */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <div className="space-y-3 ml-4">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSortChange(option.id)}
              className={`text-sm text-left w-full hover:underline transition-all ${
                sortBy === option.id ? 'font-bold' : 'font-normal'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Volume</h3>
        <div className="space-y-3 ml-4">
          {volumeOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option.id}
                checked={volumeFilter.includes(option.id)}
                onChange={() => handleCheckboxChange(option.id, volumeFilter, setVolumeFilter)}
                className="w-4 h-4 accent-gray-900"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Collection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Collection</h3>
        <div className="space-y-3 ml-4">
          {collectionOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option.id}
                checked={collectionFilter.includes(option.id)}
                onChange={() => handleCheckboxChange(option.id, collectionFilter, setCollectionFilter)}
                className="w-4 h-4 accent-gray-900"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fragrance Notes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fragrance Notes</h3>
        <div className="space-y-3 ml-4">
          {fragranceNotesOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option.id}
                checked={fragranceNotesFilter.includes(option.id)}
                onChange={() => handleCheckboxChange(option.id, fragranceNotesFilter, setFragranceNotesFilter)}
                className="w-4 h-4 accent-gray-900"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
