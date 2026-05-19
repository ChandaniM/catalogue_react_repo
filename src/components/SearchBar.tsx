import { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  tags?: string[];
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
}

const SearchBar = ({ value, onChange, tags = [], selectedTag = '', onTagSelect }: SearchBarProps) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleTagSelect = (tag: string) => {
    onTagSelect?.(tag);
    setIsOverlayOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
      {/* Search Input with Category Button on Mobile */}
      <div className="flex gap-2 sm:gap-0 w-full max-w-4xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search for the perfect gift..."
          className="flex-1 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base lg:text-lg border border-gray-200 rounded-full bg-white text-[var(--charcoal)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] shadow-sm"
        />
        
        {/* Mobile Category Button */}
        {tags.length > 0 && (
          <button
            onClick={() => setIsOverlayOpen(true)}
            className="sm:hidden flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-[var(--charcoal)] shadow-sm hover:border-[var(--primary)] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {selectedTag || 'Category'}
          </button>
        )}
      </div>

      {/* Desktop Category Tags */}
      {tags.length > 0 && (
        <div className="hidden sm:flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 px-1">
          <button
            onClick={() => onTagSelect?.('')}
            style={{ fontFamily: 'Jost, sans-serif' }}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
              selectedTag === ''
                ? 'bg-[#7A4D6A] text-[#E8C5DF]'
                : 'bg-white text-[var(--charcoal)] border border-gray-200 hover:border-[var(--primary)]'
            }`}
          >
            All Gifts
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect?.(tag)}
              style={{ fontFamily: 'Jost, sans-serif' }}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ${
                selectedTag === tag
                  ? 'bg-[#7A4D6A] text-[#E8C5DF]'
                  : 'bg-white text-[var(--charcoal)] border border-gray-200 hover:border-[var(--primary)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Category Overlay */}
      {isOverlayOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOverlayOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 animate-slide-up">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: 'Jost, sans-serif' }} className="text-lg font-semibold text-[var(--charcoal)]">Select Category</h3>
              <button 
                onClick={() => setIsOverlayOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Category Options */}
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => handleTagSelect('')}
                style={{ fontFamily: 'Jost, sans-serif' }}
                className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-all ${
                  selectedTag === ''
                    ? 'bg-[#7A4D6A] text-[#E8C5DF]'
                    : 'bg-gray-50 text-[var(--charcoal)] hover:bg-gray-100'
                }`}
              >
                All Gifts
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  style={{ fontFamily: 'Jost, sans-serif' }}
                  className={`w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-[#7A4D6A] text-[#E8C5DF]'
                      : 'bg-gray-50 text-[var(--charcoal)] hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
