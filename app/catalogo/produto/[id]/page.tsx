'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PublicProduct, PublicCatalogSettings } from '@/types/public-catalog.types';
import { fetchPublicProducts, getPublicCatalogSettings, generateWhatsAppPurchaseUrl } from '@/lib/public-catalog';
import { PublicHeader } from '@/components/public-catalog/public-header';
import { PublicFooter } from '@/components/public-catalog/public-footer';
import { PublicProductCard } from '@/components/public-catalog/public-product-card';
import { ShareModal } from '@/components/public-catalog/share-modal';
import { 
  ArrowLeft, MessageCircle, Share2, ShieldCheck, Lock, Truck, Sparkles, Tag, Package, ChevronRight, Copy, Check 
} from 'lucide-react';

export default function PublicProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [allProducts, setAllProducts] = useState<PublicProduct[]>([]);
  const [settings, setSettings] = useState<PublicCatalogSettings>(getPublicCatalogSettings());
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals & Copy Feedback
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prods = await fetchPublicProducts();
        setAllProducts(prods);
        const found = prods.find(p => p.id === productId || p.slug === productId);
        if (found) {
          setProduct(found);
          setSelectedImage(found.image_url || '');
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do produto:', err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadData();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#EC0E78] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF4FA0]">
          Carregando Produto Pink Pulse...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0D0B0E] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#18111A] border border-white/10 p-8 rounded-[24px] space-y-4">
          <Package className="w-12 h-12 text-[#FF4FA0] mx-auto opacity-50" />
          <h2 className="text-xl font-bold font-display uppercase">Produto não encontrado</h2>
          <p className="text-xs text-white/60">
            O produto solicitado pode ter sido desativado ou não está mais disponível no catálogo.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EC0E78] text-white font-bold text-xs uppercase rounded-xl hover:bg-[#FF4FA0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  // Related products (same category or brand)
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.brand === product.brand))
    .slice(0, 4);

  const formattedPrice = `R$ ${product.sell_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const whatsappPurchaseUrl = generateWhatsAppPurchaseUrl(
    product.name,
    product.sell_price,
    settings.whatsappNumber,
    settings.whatsappMessageTemplate
  );

  const currentProductUrl = typeof window !== 'undefined' ? window.location.href : `https://pinkpulse.com/catalogo/produto/${product.id}`;

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(currentProductUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-white font-sans flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <PublicHeader
          settings={settings}
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            if (val.trim()) router.push('/catalogo');
          }}
        />

        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Link href="/catalogo" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Catálogo</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[#FF4FA0] font-bold">{product.category_name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-white/80 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
          </div>
        </div>

        {/* Main Product Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Image */}
              <div className="relative aspect-square rounded-[28px] overflow-hidden bg-[#18111A] border border-white/15 flex items-center justify-center shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    priority
                  />
                ) : (
                  <div className="p-8 text-center">
                    <span className="text-[#FF4FA0] font-bold text-sm uppercase">Pink Pulse VIP</span>
                  </div>
                )}

                {/* Badge if present */}
                {product.badge && (
                  <span className="absolute top-4 left-4 px-4 py-1.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white text-xs font-bold uppercase rounded-full shadow-lg border border-white/20">
                    {product.badge}
                  </span>
                )}

                {/* Discreet Seal */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Envio 100% Discreto</span>
                </div>
              </div>

              {/* Thumbnails list if multiple */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        selectedImage === imgUrl ? 'border-[#EC0E78] scale-105 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgUrl} alt="" fill sizes="80px" className="object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 bg-[#18111A] border border-white/15 rounded-[28px] p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
              
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-3 py-1 bg-[#8B0D4E] text-white text-xs font-bold uppercase rounded-full border border-white/10">
                    {product.category_name}
                  </span>
                  {product.brand && (
                    <span className="text-xs text-white/50 uppercase font-mono">
                      Marca: {product.brand}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Block */}
              <div className="p-4 bg-[#0F0B11] border border-white/10 rounded-[20px] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 uppercase block">Valor Promocional VIP</span>
                  <span className="text-3xl font-black text-[#FF4FA0] font-display">
                    {formattedPrice}
                  </span>
                </div>

                <div className="text-right">
                  {product.in_stock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Em Estoque</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                      <span>Sob Encomenda</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Descrição do Produto
                </h3>
                <p className="text-sm text-white/80 leading-relaxed font-sans whitespace-pre-line bg-black/20 p-4 rounded-xl border border-white/5">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons (Comprar & Compartilhar) */}
              <div className="space-y-3 pt-2">
                
                {/* Button Comprar -> WhatsApp */}
                <a
                  href={whatsappPurchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-[18px] shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white/20" />
                  <span>Comprar pelo WhatsApp</span>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase rounded-[16px] transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#FF4FA0]" />
                    <span>Compartilhar</span>
                  </button>

                  <button
                    onClick={handleCopyDirectLink}
                    className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase rounded-[16px] transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FF4FA0]" />}
                    <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                  </button>
                </div>

              </div>

              {/* Guarantees Box */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#FF4FA0]" />
                  <span>Caixa Discreta</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Entrega Rápida</span>
                </div>
              </div>

            </div>

          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold font-display uppercase text-white">
                  Produtos Relacionados
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(rel => (
                  <PublicProductCard
                    key={rel.id}
                    product={rel}
                    whatsappNumber={settings.whatsappNumber}
                    whatsappTemplate={settings.whatsappMessageTemplate}
                  />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          title={product.name}
          url={currentProductUrl}
          text={`Confira ${product.name} no Catálogo Pink Pulse: R$ ${product.sell_price.toFixed(2)}`}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Footer */}
      <PublicFooter settings={settings} />

    </div>
  );
}
