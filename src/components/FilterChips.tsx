import { useState } from 'react';

export interface ChipItem {
  key: string;
  label: string;
}

interface FilterChipsProps {
  chips: ChipItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  allLabel?: string;
  mobileTitle?: string;
  showMobileButton?: boolean;
  showDesktopChips?: boolean;
}

const FilterChips = ({
  chips,
  selectedKey,
  onSelect,
  allLabel = 'All',
  mobileTitle = 'Filter',
  showMobileButton = true,
  showDesktopChips = true,
}: FilterChipsProps) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  if (chips.length === 0) return null;

  const handleSelect = (key: string) => {
    onSelect(key);
    setIsOverlayOpen(false);
  };

  const chipClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
      active
        ? 'bg-[#7A4D6A] text-[#E8C5DF]'
        : 'bg-white text-[var(--charcoal)] border border-gray-200 hover:border-[var(--primary)]'
    }`;

  return (
    <>
      {showMobileButton && (
        <button
          onClick={() => setIsOverlayOpen(true)}
          className="sm:hidden relative flex items-center justify-center w-11 h-11 bg-white border border-gray-200 rounded-full text-[var(--charcoal)] shadow-sm hover:border-[var(--primary)] transition-all active:scale-95 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />
          </svg>
          {selectedKey && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[var(--primary)] rounded-full border-2 border-white" />
          )}
        </button>
      )}

      {showDesktopChips && (
        <div className="hidden sm:flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 px-1">
          <button onClick={() => onSelect('')} style={{ fontFamily: 'Jost, sans-serif' }} className={chipClass(selectedKey === '')}>
            {allLabel}
          </button>
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onSelect(chip.key)}
              style={{ fontFamily: 'Jost, sans-serif' }}
              className={chipClass(selectedKey === chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {showMobileButton && isOverlayOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOverlayOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'Jost, sans-serif' }} className="text-lg font-semibold text-[var(--charcoal)]">
                {mobileTitle}
              </h3>
              <button
                onClick={() => setIsOverlayOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => handleSelect('')}
                style={{ fontFamily: 'Jost, sans-serif' }}
                className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-all ${
                  selectedKey === '' ? 'bg-[#7A4D6A] text-[#E8C5DF]' : 'bg-gray-50 text-[var(--charcoal)] hover:bg-gray-100'
                }`}
              >
                {allLabel}
              </button>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => handleSelect(chip.key)}
                  style={{ fontFamily: 'Jost, sans-serif' }}
                  className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-all ${
                    selectedKey === chip.key ? 'bg-[#7A4D6A] text-[#E8C5DF]' : 'bg-gray-50 text-[var(--charcoal)] hover:bg-gray-100'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterChips;
