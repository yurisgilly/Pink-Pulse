'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PublicProduct, PublicCategory, PublicCatalogSettings } from '@/types/public-catalog.types';
import { fetchPublicProducts, fetchPublicCategories, getPublicCatalogSettings } from '@/lib/public-catalog';
import { PublicHeader } from '@/components/public-catalog/public-header';
import { PublicBanner } from '@/components/public-catalog/public-banner';
import { PublicFilterBar } from '@/components/public-catalog/public-filter-bar';
import { PublicProductCard } from '@/components/public-catalog/public-product-card';
import { PublicFooter } from '@/components/public-catalog/public-footer';
import { FloatingWhatsapp } from '@/components/public-catalog/floating-whatsapp';
import { Sparkles, Filter, Package, Flame, Star, Gift, Tag, RefreshCw } from 'lucide-react';

export default function PublicCatalogPage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [settings, setSettings] = useState<PublicCatalogSettings>(getPublicCatalogSettings());
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [featuredTab, setFeaturedTab] = useState<'all' | 'mais_vendidos' | 'lancamentos' | 'promocoes' | 'novidades'>('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pData, cData] = await Promise.all([
          fetchPublicProducts(),
          fetchPublicCategories()
        ]);
        if (active) {
          setProducts(pData);
          setCategories(cData);
          setSettings(getPublicCatalogSettings());
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar catálogo público:', err);
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(term);
        const catMatch = p.category_name.toLowerCase().includes(term);
        const brandMatch = p.brand?.toLowerCase().includes(term) || false;
        const descMatch = p.description.toLowerCase().includes(term);
        const tagMatch = p.tags?.some(t => t.toLowerCase().includes(term)) || false;
        if (!nameMatch && !catMatch && !brandMatch && !descMatch && !tagMatch) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategorySlug) {
        if (p.category_slug !== selectedCategorySlug) return false;
      }

      // 3. Featured tab
      if (featuredTab === 'mais_vendidos') {
        if (p.badge !== 'Mais vendido' && !settings.featuredProductIds.includes(p.id)) return false;
      } else if (featuredTab === 'lancamentos') {
        if (p.badge !== 'Lançamento' && p.badge !== 'Novo') return false;
      } else if (featuredTab === 'promocoes') {
        if (p.badge !== 'Promoção') return false;
      } else if (featuredTab === 'novidades') {
        if (p.badge !== 'Novo' && p.badge !== 'Últimas unidades') return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategorySlug, featuredTab, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#EC0E78] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF4FA0] font-mono">
          Carregando Catálogo Pink Pulse...
        </span>
      </div>
    );
  }

  // If public catalog disabled in ERP settings
  if (!settings.enabled) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#18111A] border border-white/10 p-8 rounded-[24px] space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display uppercase text-white">Catálogo Temporariamente Indisponível</h1>
          <p className="text-xs text-white/70 leading-relaxed">
            Estamos atualizando nossa vitrine VIP com novos lançamentos exclusivos. Retorne em instantes.
          </p>
          <a
            href={`https://wa.me/55${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de atendimento direto.')}`}
            className="inline-block px-6 py-3 bg-[#EC0E78] text-white font-bold text-xs uppercase rounded-xl hover:bg-[#FF4FA0] transition-colors"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-white font-sans selection:bg-[#EC0E78] selection:text-white flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <PublicHeader
          settings={settings}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Main Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-8">
          
          {/* Configurable Banner */}
          <PublicBanner settings={settings} />

          {/* Unified Filter Bar */}
          <PublicFilterBar
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={setSelectedCategorySlug}
            featuredTab={featuredTab}
            onSelectTab={setFeaturedTab}
            totalProductsCount={products.length}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#18111A] border border-white/10 rounded-[24px] p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-[#FF4FA0] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white uppercase">Nenhum produto encontrado</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Tente buscar com outro termo ou selecionar outra categoria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategorySlug(null);
                  setFeaturedTab('all');
                }}
                className="px-4 py-2 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <PublicProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={settings.whatsappNumber}
                  whatsappTemplate={settings.whatsappMessageTemplate}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <PublicFooter settings={settings} />

      {/* Discreet Floating WhatsApp Button */}
      <FloatingWhatsapp whatsappNumber={settings.whatsappNumber} />

    </div>
  );
}
