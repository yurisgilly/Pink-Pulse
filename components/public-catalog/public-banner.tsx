'use client';

import React from 'react';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
import { PublicCatalogSettings } from '@/types/public-catalog.types';

interface PublicBannerProps {
  settings: PublicCatalogSettings;
  onExploreClick?: () => void;
}

export const PublicBanner: React.FC<PublicBannerProps> = ({ settings, onExploreClick }) => {
  const { banner } = settings;

  if (!banner || !banner.enabled) return null;

  return (
    <div className="relative my-6 rounded-[24px] overflow-hidden border border-white/15 bg-gradient-to-r from-[#180A15] via-[#2A081D] to-[#8B0D4E] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      
      {/* Background Image overlay */}
      {banner.imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay transition-all duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${banner.imageUrl})` }}
        />
      )}

      {/* Radial Pink Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#EC0E78]/20 blur-[100px] pointer-events-none" />

      {/* Main Banner Content */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center">
        
        <div className="space-y-4 max-w-2xl flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            {banner.title || 'Prazer, Conexão e Bem-Estar'}
          </h1>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans max-w-xl">
            {banner.subtitle || settings.description}
          </p>

          {/* Value Badges (Entrega Discreta, Qualidade, Segurança) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-white/70">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <Lock className="w-3.5 h-3.5 text-[#FF4FA0]" />
              <span>Embalagem 100% Discreta</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantia de Qualidade</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              <span>Envio Rápido e Seguro</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
