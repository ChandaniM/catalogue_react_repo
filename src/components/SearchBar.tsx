import type { ChipItem } from './FilterChips';
import FilterChips from './FilterChips';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  chips?: ChipItem[];
  selectedChip?: string;
  onChipSelect?: (key: string) => void;
  allLabel?: string;
  mobileTitle?: string;
  showChips?: boolean;
}

const SearchBar = ({
  value,
  onChange,
  chips = [],
  selectedChip = '',
  onChipSelect,
  allLabel = 'All',
  mobileTitle = 'Select Category',
  showChips = true,
}: SearchBarProps) => {
  const hasChips = showChips && chips.length > 0 && onChipSelect;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
      <div className="flex gap-2 sm:gap-0 w-full max-w-4xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for the perfect gift..."
          className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-200 rounded-full bg-white text-[var(--charcoal)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] shadow-sm"
        />

        {hasChips && (
          <FilterChips
            chips={chips}
            selectedKey={selectedChip}
            onSelect={onChipSelect}
            allLabel={allLabel}
            mobileTitle={mobileTitle}
            showMobileButton
            showDesktopChips={false}
          />
        )}
      </div>

      {hasChips && (
        <FilterChips
          chips={chips}
          selectedKey={selectedChip}
          onSelect={onChipSelect}
          allLabel={allLabel}
          mobileTitle={mobileTitle}
          showMobileButton={false}
          showDesktopChips
        />
      )}
    </div>
  );
};

export default SearchBar;
