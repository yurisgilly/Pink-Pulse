'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicProduct, PublicCatalogSettings } from '@/types/public-catalog.types';
import { fetchPublicProducts, getPublicCatalogSettings } from '@/lib/public-catalog';
import { PublicHeader } from '@/components/public-catalog/public-header';
import { PublicFooter } from '@/components/public-catalog/public-footer';
import { PublicProductCard } from '@/components/public-catalog/public-product-card';
import { Search, Package, ArrowLeft, X } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('q') || '' : '';

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [settings, setSettings] = useState<PublicCatalogSettings>(getPublicCatalogSettings());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prods = await fetchPublicProducts();
        setProducts(prods);
        setSettings(getPublicCatalogSettings());
      } catch (err) {
        console.error('Erro ao carregar busca:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase().trim();
    return products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(term);
      const catMatch = p.category_name.toLowerCase().includes(term);
      const brandMatch = p.brand?.toLowerCase().includes(term) || false;
      const descMatch = p.description.toLowerCase().includes(term);
      const tagMatch = p.tags?.some(t => t.toLowerCase().includes(term)) || false;
      return nameMatch || catMatch || brandMatch || descMatch || tagMatch;
    });
  }, [products, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#EC0E78] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF4FA0]">
          Buscando Produtos Pink Pulse...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-white font-sans flex flex-col justify-between">
      <div>
        <PublicHeader
          settings={settings}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Search Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#180A15] via-[#2A081D] to-[#8B0D4E] border border-white/15 rounded-[28px] shadow-2xl space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#FF4FA0] font-bold uppercase hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Catálogo</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-2xl">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-white">
                    Busca no Catálogo
                  </h1>
                  <p className="text-xs text-white/70">
                    {searchTerm.trim()
                      ? `Exibindo resultados para "${searchTerm}" (${searchResults.length} encontrados)`
                      : `Exibindo todos os ${searchResults.length} produtos disponíveis`}
                  </p>
                </div>
              </div>

              {searchTerm.trim() && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <X className="w-4 h-4 text-[#FF4FA0]" />
                  <span>Limpar Busca</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {searchResults.length === 0 ? (
            <div className="bg-[#18111A] border border-white/10 rounded-[24px] p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-[#FF4FA0] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white uppercase">Nenhum produto encontrado</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Não encontramos itens correspondentes a &quot;{searchTerm}&quot;. Tente pesquisar com termos mais genéricos.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-5 py-2.5 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
              >
                Ver Todo o Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product) => (
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

      <PublicFooter settings={settings} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0B0E] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#EC0E78] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
