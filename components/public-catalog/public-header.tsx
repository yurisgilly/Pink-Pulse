'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/sem coraçao.png';
import { Search, Sparkles, MessageCircle, Heart, X, ShoppingBag } from 'lucide-react';
import { PublicCatalogSettings } from '@/types/public-catalog.types';

interface PublicHeaderProps {
  settings: PublicCatalogSettings;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cartCount?: number;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  settings,
  searchTerm,
  onSearchChange,
  cartCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F0B11]/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-[126px]">
          
          {/* Logo */}
          <Link href="/catalogo" className="flex items-center group py-2">
            <div className="relative w-[148px] h-auto flex items-center justify-center">
              <Image 
                src={logoImg} 
                alt="Pink Pulse Logo" 
                className="w-[148px] h-[150px] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(236,14,120,0.4)] mt-[7px]"
                priority
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
};
