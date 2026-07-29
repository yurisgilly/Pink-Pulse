'use client';

import React, { useState } from 'react';
import { Product, Category, Supplier } from '@/types/erp.types';
import { useERP } from '@/contexts/erp.context';
import { 
  X, Heart, MessageCircle, Copy, Check, Save, Sparkles, Image as ImageIcon, Package, Tag, Building, Store 
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  products,
  categories,
  suppliers,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectProduct,
}) => {
  const { updateProductFull } = useERP();

  // Editable form fields state
  const [name, setName] = useState(product.name || '');
  const [categoryId, setCategoryId] = useState(product.category_id || (categories[0]?.id || ''));
  const [brand, setBrand] = useState(product.brand || '');
  const [supplierId, setSupplierId] = useState(product.supplier_id || (suppliers[0]?.id || ''));
  const [sellPrice, setSellPrice] = useState<number | string>(product.sell_price || 0);
  const [stock, setStock] = useState<number | string>(product.stock || 0);
  const [description, setDescription] = useState(product.description || '');
  const [imageUrl, setImageUrl] = useState(product.image_url || '');

  const [activeImage, setActiveImage] = useState(product.image_url || '');
  const [copiedText, setCopiedText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [prevProductId, setPrevProductId] = useState(product.id);

  if (prevProductId !== product.id) {
    setPrevProductId(product.id);
    setName(product.name || '');
    setCategoryId(product.category_id || (categories[0]?.id || ''));
    setBrand(product.brand || '');
    setSupplierId(product.supplier_id || (suppliers[0]?.id || ''));
    setSellPrice(product.sell_price || 0);
    setStock(product.stock || 0);
    setDescription(product.description || '');
    setImageUrl(product.image_url || '');
    setActiveImage(product.image_url || '');
  }

  const formattedPrice = Number(sellPrice || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // WhatsApp Message Template strictly following requirement #2:
  // 💗 *{Nome do Produto}*
  // {Descrição do Produto}
  // 💰 Valor: R$ {Preço}
  // 📦 Produto disponível na Pink Pulse.
  // 🚚 Envio totalmente discreto.
  // Entre em contato para fazer seu pedido.
  const getFormattedMessage = () => {
    const desc = description.trim() ? description.trim() : 'Produto exclusivo de altíssima qualidade.';
    return `💗 *${name}*\n\n${desc}\n\n💰 Valor: R$ ${formattedPrice}\n\n📦 Produto disponível na Pink Pulse.\n\n🚚 Envio totalmente discreto.\n\nEntre em contato para fazer seu pedido.`;
  };

  const handleCopyDescription = () => {
    const textToCopy = getFormattedMessage();
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = getFormattedMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProductFull(
        product.id,
        {
          name,
          category_id: categoryId,
          brand,
          supplier_id: supplierId,
          buy_price: product.buy_price || 0,
          sell_price: Number(sellPrice),
          stock: Number(stock),
          min_stock: product.min_stock || 5,
          barcode: product.barcode,
          expiry_date: product.expiry_date,
          image_url: imageUrl,
          description: description,
        },
        'Atualização via Ficha Técnica do Catálogo'
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as alterações do produto.');
    } finally {
      setIsSaving(false);
    }
  };

  // Related Products (Only Foto, Nome, Preço)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category_id === categoryId || p.supplier_id === supplierId))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in text-[#f2efeb]">
      <div className="bg-[#18181A] border border-[#ECEEF5]/15 rounded-[24px] max-w-4xl w-full p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] relative overflow-hidden my-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`p-2.5 rounded-[14px] border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-[#EC0E78] text-white border-[#EC0E78] shadow-[0_0_12px_rgba(236,14,120,0.5)]' 
                  : 'bg-white/5 border-white/15 text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <div>
              <span className="text-[10px] font-mono-custom text-[#FF4FA0] font-bold uppercase tracking-widest block">
                FICHA TÉCNICA EDITÁVEL • SKU: {product.sku}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight leading-tight">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-rose-600/30 text-white rounded-[14px] border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Editable Layout Grid */}
        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Photo Column (4/12) */}
          <div className="md:col-span-5 space-y-4">
            <div className="relative aspect-square rounded-[22px] overflow-hidden bg-black/50 border border-white/15 flex items-center justify-center shadow-inner group">
              {activeImage || imageUrl ? (
                <img 
                  src={activeImage || imageUrl} 
                  alt={name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 text-center text-[#EC0E78] font-bold font-mono-custom">
                  PINK PULSE CATALOG
                </div>
              )}
            </div>

            {/* Image URL Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono-custom uppercase tracking-wider text-white/60 font-bold block">
                URL da Imagem Principal
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setActiveImage(e.target.value);
                }}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[14px] px-3.5 py-2 text-xs text-white placeholder:text-white/30 font-mono-custom transition-all outline-none"
              />
            </div>
          </div>

          {/* Form Fields Column (7/12) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Nome do Produto */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                Nome do Produto
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] px-4 py-2.5 text-xs text-white font-mono-custom transition-all outline-none"
              />
            </div>

            {/* Categoria & Marca Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] px-3.5 py-2.5 text-xs text-white font-mono-custom transition-all outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-[#18181A] text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                  Marca
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="Ex: Pink Pulse"
                  className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] px-4 py-2.5 text-xs text-white font-mono-custom transition-all outline-none"
                />
              </div>
            </div>

            {/* Fornecedor */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                Fornecedor
              </label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] px-3.5 py-2.5 text-xs text-white font-mono-custom transition-all outline-none"
              >
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id} className="bg-[#18181A] text-white">
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preço de Venda & Estoque Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                  required
                  className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] text-[#FF4FA0] font-bold rounded-[16px] px-4 py-2.5 text-sm font-mono-custom transition-all outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  required
                  className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] px-4 py-2.5 text-sm font-mono-custom transition-all outline-none text-white font-bold"
                />
              </div>
            </div>

            {/* Descrição Editable Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono-custom uppercase tracking-wider text-white/70 font-bold block">
                Descrição do Produto
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Escreva a descrição detalhada do produto que será enviada aos clientes..."
                className="w-full bg-[#111113] border border-white/15 focus:border-[#EC0E78] rounded-[16px] p-3.5 text-xs text-white placeholder:text-white/30 font-sans transition-all outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Action Buttons: Save & Feedback */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {saveSuccess && (
                <span className="text-xs font-mono-custom font-bold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                  <Check className="w-4 h-4" /> Alterações salvas com sucesso!
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.02] active:scale-[0.98] text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* WhatsApp & Copy Buttons Action Bar */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] transition-all cursor-pointer hover:scale-[1.01]"
          >
            <MessageCircle className="w-4.5 h-4.5 text-emerald-400" />
            <span>Enviar para WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyDescription}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] transition-all cursor-pointer hover:scale-[1.01]"
          >
            {copiedText ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5 text-[#FF4FA0]" />}
            <span>{copiedText ? 'Descrição Copiada!' : 'Copiar Descrição'}</span>
          </button>
        </div>

        {/* Produtos Relacionados (Strict Rule #8: Exibir apenas Imagem, Nome, Preço) */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-white/10 pt-5 space-y-3">
            <h3 className="text-xs font-bold font-mono-custom text-white/70 uppercase tracking-wider">
              PRODUTOS RELACIONADOS
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(p);
                  }}
                  className="p-3 bg-black/40 border border-white/10 hover:border-[#EC0E78]/50 rounded-[18px] space-y-2 cursor-pointer transition-all hover:scale-[1.02] group"
                >
                  <div className="aspect-square rounded-[14px] bg-black/60 overflow-hidden">
                    <img 
                      src={p.image_url || ''} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <span className="text-xs font-extrabold text-[#FF4FA0] font-display block">
                    R$ {Number(p.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
