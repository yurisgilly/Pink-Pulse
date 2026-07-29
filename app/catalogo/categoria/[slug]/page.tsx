'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicProduct, PublicCategory, PublicCatalogSettings } from '@/types/public-catalog.types';
import { fetchPublicProducts, fetchPublicCategories, getPublicCatalogSettings } from '@/lib/public-catalog';
import { PublicHeader } from '@/components/public-catalog/public-header';
import { PublicFooter } from '@/components/public-catalog/public-footer';
import { PublicProductCard } from '@/components/public-catalog/public-product-card';
import { ArrowLeft, Layers, Package } from 'lucide-react';

export default function PublicCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.slug as string;

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<PublicCategory | null>(null);
  const [settings, setSettings] = useState<PublicCatalogSettings>(getPublicCatalogSettings());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          fetchPublicProducts(),
          fetchPublicCategories()
        ]);
        setProducts(prods);
        setCategories(cats);

        const matchedCat = cats.find(c => c.slug === categorySlug || c.id === categorySlug);
        if (matchedCat) {
          setCurrentCategory(matchedCat);
        }
      } catch (err) {
        console.error('Erro ao carregar categoria:', err);
      } finally {
        setLoading(false);
      }
    }
    if (categorySlug) loadCategoryData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#EC0E78] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF4FA0]">
          Carregando Categoria Pink Pulse...
        </span>
      </div>
    );
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = currentCategory ? p.category_id === currentCategory.id || p.category_slug === currentCategory.slug : true;
    if (!matchesCategory) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-white font-sans flex flex-col justify-between">
      
      <div>
        <PublicHeader
          settings={settings}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Category Banner Header */}
          <div className="p-8 bg-gradient-to-r from-[#180A15] via-[#2A081D] to-[#8B0D4E] border border-white/15 rounded-[28px] shadow-2xl flex items-center justify-between gap-6">
            <div className="space-y-2">
              <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-xs text-[#FF4FA0] font-bold uppercase hover:underline mb-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Catálogo Geral</span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentCategory?.icon || '✨'}</span>
                <h1 className="text-2xl sm:text-4xl font-black font-display uppercase tracking-tight text-white">
                  {currentCategory?.name || 'Categoria Exclusiva'}
                </h1>
              </div>
              <p className="text-xs text-white/70 max-w-xl">
                {currentCategory?.description || 'Confira os itens selecionados desta categoria no catálogo Pink Pulse.'}
              </p>
            </div>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div className="bg-[#18111A] border border-white/10 rounded-[24px] p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-[#FF4FA0] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-white uppercase">Nenhum produto nesta categoria</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Explore outras categorias em destaque no catálogo.
              </p>
              <Link
                href="/catalogo"
                className="inline-block px-4 py-2 bg-[#EC0E78] text-white text-xs font-bold uppercase rounded-xl"
              >
                Ver Catálogo Completo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
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
