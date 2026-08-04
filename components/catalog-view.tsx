'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useERP } from '@/contexts/erp.context';
import { Product } from '@/types/erp.types';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { CatalogOverview } from '@/components/catalog-overview';
import { ExportCatalogModal } from '@/components/export-catalog-modal';
import { 
  BookOpen, Search, Filter, LayoutGrid, List, Heart, Share2, Eye, MessageCircle, Copy, Check, Package, X 
} from 'lucide-react';

export const CatalogView: React.FC = () => {
  const { products, categories, suppliers } = useERP();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [smartFilter, setSmartFilter] = useState<'all' | 'favorites'>('all');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // View Mode: Cards (default) or List
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pink_pulse_favorite_products');
        return saved ? JSON.parse(saved) : [];
      } catch (err) {
        return [];
      }
    }
    return [];
  });

  // Selected product for detail/ficha técnica modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Visão Geral Modal & initial format
  const [showOverview, setShowOverview] = useState(false);
  const [overviewFormat, setOverviewFormat] = useState<'pdf' | 'jpg' | 'png' | undefined>(undefined);

  // Export / Share Catalog Modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Quick feedback for card actions
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pink_pulse_favorite_products', JSON.stringify(next));
      }
      return next;
    });
  };

  // Brands list
  const brands = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => {
      if (p.brand?.trim()) list.add(p.brand.trim());
    });
    return Array.from(list);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(term);
        const skuMatch = p.sku.toLowerCase().includes(term);
        const brandMatch = p.brand?.toLowerCase().includes(term);
        const descMatch = p.description?.toLowerCase().includes(term);
        if (!nameMatch && !skuMatch && !brandMatch && !descMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;

      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      // Supplier filter
      if (selectedSupplier !== 'all' && p.supplier_id !== selectedSupplier) return false;

      // Availability filter
      if (availabilityFilter === 'in_stock' && p.stock <= 0) return false;
      if (availabilityFilter === 'out_of_stock' && p.stock > 0) return false;

      // Smart filter
      if (smartFilter === 'favorites' && !favorites.includes(p.id)) return false;

      return true;
    });
  }, [
    products, searchTerm, selectedCategory, selectedBrand, selectedSupplier, 
    availabilityFilter, smartFilter, favorites
  ]);

  const getCategoryName = (id?: string) => {
    if (!id) return 'Acessórios';
    return categories.find(c => c.id === id)?.name || 'Geral';
  };

  // WhatsApp template format following directive #2
  const getProductWhatsAppText = (p: Product) => {
    const priceFormatted = Number(p.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const desc = p.description?.trim() ? p.description.trim() : 'Produto exclusivo de altíssima qualidade.';
    return `💗 *${p.name}*\n\n${desc}\n\n💰 Valor: R$ ${priceFormatted}\n\n📦 Produto disponível na Pink Pulse.\n\n🚚 Envio totalmente discreto.\n\nEntre em contato para fazer seu pedido.`;
  };

  const handleShareProductWhatsApp = (p: Product) => {
    const text = getProductWhatsAppText(p);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyProductDescription = (p: Product) => {
    const text = getProductWhatsAppText(p);
    navigator.clipboard.writeText(text);
    setCopiedCardId(p.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#f2efeb]">
      
      {/* Module Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#18181A] via-[#1F0D19] to-[#8B0D4E] border border-white/15 rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] text-white flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Title */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white rounded-[18px] shadow-[0_4px_16px_rgba(236,14,120,0.4)]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight uppercase text-white">
              CATÁLOGO VIRTUAL
            </h2>
            <p className="text-xs text-white/70 font-mono-custom uppercase tracking-wider mt-1">
              Vitrine digital de apresentação, fichas técnicas e exportação de vendas.
            </p>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Visão Geral Button */}
          <button
            onClick={() => setShowOverview(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-[#FF4FA0]" />
            <span>Visão Geral</span>
          </button>

          {/* Exportar / Compartilhar Catálogo Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Exportar Catálogo</span>
          </button>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 bg-[#18181A] border border-white/10 rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome, SKU, marca, categoria ou descrição..."
            className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[16px] pl-11 pr-4 py-2.5 text-xs text-white placeholder:text-white/40 font-mono-custom transition-colors outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Smart Filters Pills */}
          <button
            onClick={() => setSmartFilter(prev => prev === 'favorites' ? 'all' : 'favorites')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-[14px] text-xs font-mono-custom uppercase font-bold transition-all cursor-pointer border ${
              smartFilter === 'favorites'
                ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white border-[#EC0E78] shadow-md'
                : 'bg-[#111113] border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${smartFilter === 'favorites' ? 'fill-current' : ''}`} />
            <span>Favoritos ({favorites.length})</span>
          </button>

          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-mono-custom uppercase font-bold transition-all cursor-pointer border ${
              showFiltersModal || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedSupplier !== 'all'
                ? 'bg-[#EC0E78]/20 border-[#EC0E78] text-[#FF4FA0]'
                : 'bg-[#111113] border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#111113] border border-white/10 rounded-[16px] p-1 gap-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-[12px] transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-[12px] transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
              title="Visualização em Lista Compacta"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFiltersModal && (
        <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] space-y-4 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold font-mono-custom uppercase text-white tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#FF4FA0]" />
              <span>FILTROS AVANÇADOS</span>
            </span>
            <button onClick={() => setShowFiltersModal(false)} className="text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-custom">
            
            {/* Category Filter */}
            <div className="space-y-1">
              <label className="text-white/60 uppercase">Categoria:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-[#111113] border border-white/10 rounded-[12px] p-2.5 text-white outline-none focus:border-[#EC0E78]"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-1">
              <label className="text-white/60 uppercase">Marca:</label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full bg-[#111113] border border-white/10 rounded-[12px] p-2.5 text-white outline-none focus:border-[#EC0E78]"
              >
                <option value="all">Todas as Marcas</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="space-y-1">
              <label className="text-white/60 uppercase">Fornecedor:</label>
              <select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                className="w-full bg-[#111113] border border-white/10 rounded-[12px] p-2.5 text-white outline-none focus:border-[#EC0E78]"
              >
                <option value="all">Todos os Fornecedores</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="space-y-1">
              <label className="text-white/60 uppercase">Disponibilidade:</label>
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value as any)}
                className="w-full bg-[#111113] border border-white/10 rounded-[12px] p-2.5 text-white outline-none focus:border-[#EC0E78]"
              >
                <option value="all">Todos os Produtos</option>
                <option value="in_stock">Em Estoque</option>
                <option value="out_of_stock">Sem Estoque</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSelectedSupplier('all');
                setAvailabilityFilter('all');
                setSmartFilter('all');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono-custom uppercase rounded-[12px]"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Catalog Display Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-[#18181A] rounded-[22px] border border-white/10 space-y-3 shadow-xl">
          <Package className="w-12 h-12 text-[#FF4FA0] mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white uppercase font-mono-custom">Nenhum produto encontrado</h3>
          <p className="text-xs text-white/60 font-mono-custom">
            Ajuste seus filtros ou pesquise por outros termos.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => {
            const formattedPrice = `R$ ${Number(p.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            const isFav = favorites.includes(p.id);

            return (
              <div
                key={p.id}
                className="bg-[#18181A] hover:bg-[#1E111C] border border-white/10 hover:border-[#EC0E78]/60 rounded-[22px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-square rounded-[18px] overflow-hidden bg-[#111113] border border-white/10 flex items-center justify-center mb-4">
                  {p.image_url ? (
                    <Image 
                      src={p.image_url} 
                      alt={p.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <span className="text-[#FF4FA0] font-bold text-xs uppercase font-mono-custom">Pink Pulse</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#8B0D4E] text-white text-[9px] font-bold font-mono-custom rounded-full shadow-md uppercase border border-white/10">
                    {getCategoryName(p.category_id)}
                  </span>

                  {/* Favorite Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(p.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full border transition-all cursor-pointer ${
                      isFav 
                        ? 'bg-[#EC0E78] text-white border-[#EC0E78] shadow-md' 
                        : 'bg-black/60 border-white/20 text-white/70 hover:text-white hover:bg-black/80'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/50 font-mono-custom uppercase block">
                      SKU: {p.sku} {p.brand ? `• ${p.brand}` : ''}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2 mt-1">
                      {p.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-white/10 flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[9px] text-white/50 font-mono-custom uppercase block">VALOR</span>
                      <span className="text-xl font-extrabold text-[#FF4FA0] font-display">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>

                  {/* Direct Actions: Open Ficha Técnica / WhatsApp / Copiar */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase rounded-[14px] shadow-[0_4px_12px_rgba(236,14,120,0.3)] hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir Produto / Ficha Técnica</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleShareProductWhatsApp(p)}
                        className="flex items-center justify-center gap-1 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono-custom text-[11px] font-bold uppercase rounded-[12px] transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleCopyProductDescription(p)}
                        className="flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono-custom text-[11px] font-bold uppercase rounded-[12px] transition-all cursor-pointer"
                      >
                        {copiedCardId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#FF4FA0]" />}
                        <span>{copiedCardId === p.id ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-[#18181A] border border-white/10 rounded-[22px] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-custom border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#111113] text-white/60 uppercase tracking-wider">
                  <th className="p-4">Item</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">SKU / Marca</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white">
                {filteredProducts.map(p => {
                  const formattedPrice = `R$ ${Number(p.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  const isFav = favorites.includes(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-[#1F0D19]/40 transition-colors">
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-[10px] bg-[#111113] overflow-hidden border border-white/10">
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} fill sizes="48px" className="object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#FF4FA0] font-bold text-[8px] uppercase">Pink</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-sm text-white">
                        {p.name}
                      </td>
                      <td className="p-4 text-white/60">
                        {p.sku} {p.brand ? `• ${p.brand}` : ''}
                      </td>
                      <td className="p-4 text-white/80">
                        {getCategoryName(p.category_id)}
                      </td>
                      <td className="p-4 font-extrabold text-[#FF4FA0] text-sm font-display">
                        {formattedPrice}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleFavorite(p.id)}
                            className={`p-2 rounded-[10px] border cursor-pointer ${
                              isFav ? 'bg-[#EC0E78] text-white border-[#EC0E78]' : 'bg-white/10 border-white/10 text-white/70 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase rounded-[10px] cursor-pointer"
                          >
                            Abrir Ficha
                          </button>

                          <button
                            onClick={() => handleShareProductWhatsApp(p)}
                            className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-[10px] cursor-pointer"
                            title="Compartilhar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Detail / Ficha Técnica Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          products={products}
          categories={categories}
          suppliers={suppliers}
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Visão Geral (Digital Magazine Catalog) Modal */}
      {showOverview && (
        <CatalogOverview
          products={filteredProducts}
          categories={categories}
          initialFormat={overviewFormat}
          onClose={() => {
            setShowOverview(false);
            setOverviewFormat(undefined);
          }}
        />
      )}

      {/* Export / Share Catalog Modal */}
      {showExportModal && (
        <ExportCatalogModal
          onClose={() => setShowExportModal(false)}
          onOpenOverview={(format) => {
            setShowExportModal(false);
            setOverviewFormat(format);
            setShowOverview(true);
          }}
        />
      )}

    </div>
  );
};

export default CatalogView;
