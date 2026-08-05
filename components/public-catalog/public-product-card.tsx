'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Eye, ShieldCheck, Tag } from 'lucide-react';
import { PublicProduct } from '@/types/public-catalog.types';
import { generateWhatsAppPurchaseUrl } from '@/lib/public-catalog';

interface PublicProductCardProps {
  product: PublicProduct;
  whatsappNumber?: string;
  whatsappTemplate?: string;
}

export const PublicProductCard: React.FC<PublicProductCardProps> = ({
  product,
  whatsappNumber = '24999092402',
  whatsappTemplate
}) => {
  const formattedPrice = `R$ ${product.sell_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const whatsappUrl = generateWhatsAppPurchaseUrl(
    product.name,
    product.sell_price,
    whatsappNumber,
    whatsappTemplate
  );

  return (
    <div className="bg-[#18111A] hover:bg-[#201323] border border-white/10 hover:border-[#EC0E78]/60 rounded-[22px] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden">
      
      {/* Glow Effect on Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#EC0E78]/10 rounded-full blur-2xl group-hover:bg-[#EC0E78]/25 transition-all pointer-events-none" />

      {/* Image & Badge Header */}
      <div className="relative aspect-square rounded-[18px] overflow-hidden bg-[#0F0B11] border border-white/10 flex items-center justify-center mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="p-4 text-center">
            <span className="text-[#FF4FA0] font-bold text-xs uppercase">Pink Pulse VIP</span>
          </div>
        )}

        {/* Badge Pill */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-3 py-1 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white text-[10px] font-bold uppercase rounded-full shadow-md tracking-wider border border-white/20">
            {product.badge}
          </span>
        )}

        {/* Category Pill */}
        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white/90 text-[9px] font-bold uppercase rounded-lg border border-white/10">
          {product.category_name}
        </span>
      </div>

      {/* Product Details */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {product.brand && (
            <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider block">
              {product.brand}
            </span>
          )}
          <Link href={`/catalogo/produto/${product.id}`}>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2 mt-1 group-hover:text-[#FF4FA0] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Availability */}
        <div className="pt-2 border-t border-white/10 flex items-end justify-between">
          <div>
            <span className="text-[9px] text-white/40 uppercase block">Valor VIP</span>
            <span className="text-xl font-extrabold text-[#FF4FA0] font-display">
              {formattedPrice}
            </span>
          </div>

          <div className="text-right">
            {product.in_stock ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span>Disponível</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <span>Sob Encomenda</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/catalogo/produto/${product.id}`}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold uppercase rounded-[14px] transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#FF4FA0]" />
            <span>Ver Produto</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold uppercase rounded-[14px] shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
            <span>Comprar</span>
          </a>
        </div>

      </div>

    </div>
  );
};
