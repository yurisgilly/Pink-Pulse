'use client';

import React from 'react';
import { PublicCategory } from '@/types/public-catalog.types';
import { Layers } from 'lucide-react';

interface PublicCategoryCardsProps {
  categories: PublicCategory[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const PublicCategoryCards: React.FC<PublicCategoryCardsProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory
}) => {
  return (
    <div className="space-y-3.5 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl border border-[#EC0E78]/30">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold font-display text-white uppercase tracking-tight">
            Categorias em Destaque
          </h2>
        </div>
        
        {selectedCategorySlug && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs text-[#FF4FA0] hover:underline font-medium cursor-pointer shrink-0"
          >
            Ver Todas Categorias
          </button>
        )}
      </div>

      {/* Horizontal Carousel Container */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
        {/* "Todos" Card */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-[16px] sm:rounded-[18px] border transition-all duration-300 flex items-center justify-center group cursor-pointer whitespace-nowrap ${
            selectedCategorySlug === null
              ? 'bg-gradient-to-br from-[#8B0D4E] to-[#A40D58] border-[#EC0E78] shadow-[0_6px_18px_rgba(236,14,120,0.35)] scale-[1.02]'
              : 'bg-[#18111A] border-white/10 hover:border-[#EC0E78]/50 hover:bg-[#231222]'
          }`}
        >
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Todos
          </span>
        </button>

        {/* Dynamic Category Cards */}
        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.slug)}
              className={`shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-[16px] sm:rounded-[18px] border transition-all duration-300 flex items-center justify-center group cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-br from-[#8B0D4E] to-[#A40D58] border-[#EC0E78] shadow-[0_6px_18px_rgba(236,14,120,0.35)] scale-[1.02]'
                  : 'bg-[#18111A] border-white/10 hover:border-[#EC0E78]/50 hover:bg-[#231222]'
              }`}
            >
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

