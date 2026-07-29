'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PublicCategory } from '@/types/public-catalog.types';
import { Package, ChevronDown, Check, Star, Sparkles, Tag } from 'lucide-react';

interface PublicFilterBarProps {
  categories: PublicCategory[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  featuredTab: 'all' | 'mais_vendidos' | 'lancamentos' | 'promocoes' | 'novidades';
  onSelectTab: (tab: 'all' | 'mais_vendidos' | 'lancamentos' | 'promocoes' | 'novidades') => void;
  totalProductsCount: number;
}

export const PublicFilterBar: React.FC<PublicFilterBarProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  featuredTab,
  onSelectTab,
  totalProductsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCategory = categories.find(c => c.slug === selectedCategorySlug);

  return (
    <div className="bg-[#18111A] border border-white/10 rounded-[22px] p-3.5 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-lg relative">
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl border border-[#EC0E78]/30 shrink-0">
          <Package className="w-4 h-4" />
        </div>
        <h2 className="text-sm sm:text-base font-bold font-display uppercase tracking-tight text-white">
          Produtos
        </h2>
      </div>

      {/* Unified Filter Controls */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        
        {/* Categorias Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
              selectedCategorySlug
                ? 'bg-gradient-to-r from-[#8B0D4E] to-[#A40D58] text-white border border-[#EC0E78] shadow-md'
                : 'bg-[#0F0B11] text-white/80 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            <span>Categorias</span>
            {selectedCategorySlug && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC0E78] animate-pulse" />
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 sm:w-64 bg-[#18111A] border border-white/15 rounded-[18px] shadow-[0_12px_32px_rgba(0,0,0,0.7)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              
              <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <span>Selecionar Categoria</span>
                {selectedCategorySlug && (
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setDropdownOpen(false);
                    }}
                    className="text-[#FF4FA0] hover:underline cursor-pointer"
                  >
                    Limpar Filtro
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto px-1 space-y-0.5 scrollbar-thin scrollbar-thumb-white/20">
                {/* Option: Todos */}
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                    selectedCategorySlug === null
                      ? 'bg-[#EC0E78]/20 text-[#FF4FA0]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Todos</span>
                  {selectedCategorySlug === null && <Check className="w-3.5 h-3.5 text-[#FF4FA0]" />}
                </button>

                {/* Option: Categories */}
                {categories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(isSelected ? null : cat.slug);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold uppercase transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#EC0E78]/20 text-[#FF4FA0]'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4FA0] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tab: Mais Vendidos */}
        <button
          onClick={() => onSelectTab('mais_vendidos')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
            featuredTab === 'mais_vendidos'
              ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-md'
              : 'bg-[#0F0B11] text-white/60 hover:text-white border border-white/10'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Mais Vendidos</span>
        </button>

        {/* Tab: Lançamentos */}
        <button
          onClick={() => onSelectTab('lancamentos')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
            featuredTab === 'lancamentos'
              ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-md'
              : 'bg-[#0F0B11] text-white/60 hover:text-white border border-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Lançamentos</span>
        </button>

        {/* Tab: Promoções */}
        <button
          onClick={() => onSelectTab('promocoes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-bold uppercase transition-all duration-200 cursor-pointer ${
            featuredTab === 'promocoes'
              ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-md'
              : 'bg-[#0F0B11] text-white/60 hover:text-white border border-white/10'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Promoções</span>
        </button>

      </div>
    </div>
  );
};
