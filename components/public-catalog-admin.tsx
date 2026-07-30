'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '@/contexts/erp.context';
import { PublicCatalogSettings } from '@/types/public-catalog.types';
import { getPublicCatalogSettings, savePublicCatalogSettings } from '@/lib/public-catalog';
import { 
  Globe, Share2, QrCode, Power, Image as ImageIcon, MessageCircle, Save, Check, Copy, ExternalLink, Sparkles, Layers, RefreshCw 
} from 'lucide-react';

export const PublicCatalogAdmin: React.FC = () => {
  const { products, categories } = useERP();

  const [settings, setSettings] = useState<PublicCatalogSettings>(getPublicCatalogSettings());
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const catalogFullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/catalogo`
    : 'https://pinkpulse.com/catalogo';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(catalogFullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSettings = () => {
    savePublicCatalogSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleFeaturedProduct = (productId: string) => {
    setSettings(prev => {
      const exists = prev.featuredProductIds.includes(productId);
      const nextIds = exists
        ? prev.featuredProductIds.filter(id => id !== productId)
        : [...prev.featuredProductIds, productId];
      return { ...prev, featuredProductIds: nextIds };
    });
  };

  const toggleFeaturedCategory = (catId: string) => {
    setSettings(prev => {
      const exists = prev.featuredCategoryIds.includes(catId);
      const nextIds = exists
        ? prev.featuredCategoryIds.filter(id => id !== catId)
        : [...prev.featuredCategoryIds, catId];
      return { ...prev, featuredCategoryIds: nextIds };
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-white">
      
      {/* Module Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#180A15] via-[#2A081D] to-[#8B0D4E] border border-white/15 rounded-[22px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white rounded-[18px] shadow-[0_4px_16px_rgba(236,14,120,0.4)]">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight uppercase text-white">
                CATÁLOGO PÚBLICO
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                settings.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {settings.enabled ? 'Ativo' : 'Desativado'}
              </span>
            </div>
            <p className="text-xs text-white/70 font-mono-custom uppercase tracking-wider mt-1">
              Configurações da vitrine digital externa sem autenticação, sincronizada em tempo real com o ERP.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase rounded-[16px] transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#FF4FA0]" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase rounded-[16px] transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#FF4FA0]" />
            <span>Gerar QR Code</span>
          </button>

          <a
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase rounded-[16px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Catálogo ao Vivo</span>
          </a>
        </div>

      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Core Status, Banner & WhatsApp (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Status Toggle Card */}
          <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Power className={`w-5 h-5 ${settings.enabled ? 'text-emerald-400' : 'text-rose-400'}`} />
                <div>
                  <h3 className="text-sm font-bold uppercase text-white font-mono-custom">
                    Status do Catálogo Público
                  </h3>
                  <p className="text-xs text-white/60 font-mono-custom">
                    Habilitar ou desabilitar o acesso público do link /catalogo.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-[#EC0E78]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="text-xs font-mono-custom text-white/70 bg-[#111113] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
              <span>Link Público:</span>
              <span className="text-[#FF4FA0] font-bold select-all">{catalogFullUrl}</span>
            </div>
          </div>

          {/* Banner Configuration Card */}
          <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ImageIcon className="w-5 h-5 text-[#FF4FA0]" />
              <h3 className="text-sm font-bold uppercase text-white font-mono-custom">
                Editar Banner Principal da Home
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-custom">
              <div className="space-y-1">
                <label className="text-white/70 uppercase">Título do Banner:</label>
                <input
                  type="text"
                  value={settings.banner.title}
                  onChange={e => setSettings(prev => ({ ...prev, banner: { ...prev.banner, title: e.target.value } }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 uppercase">Texto do Botão CTA:</label>
                <input
                  type="text"
                  value={settings.banner.buttonText}
                  onChange={e => setSettings(prev => ({ ...prev, banner: { ...prev.banner, buttonText: e.target.value } }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-white/70 uppercase">Subtítulo do Banner:</label>
                <textarea
                  rows={2}
                  value={settings.banner.subtitle}
                  onChange={e => setSettings(prev => ({ ...prev, banner: { ...prev.banner, subtitle: e.target.value } }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-white/70 uppercase">URL da Imagem de Fundo:</label>
                <input
                  type="text"
                  value={settings.banner.imageUrl}
                  onChange={e => setSettings(prev => ({ ...prev, banner: { ...prev.banner, imageUrl: e.target.value } }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp & Socials Card */}
          <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase text-white font-mono-custom">
                WhatsApp de Vendas & Redes Sociais
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-custom">
              <div className="space-y-1">
                <label className="text-white/70 uppercase">Número do WhatsApp (com DDD):</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={e => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="24999092402"
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 uppercase">Instagram URL:</label>
                <input
                  type="text"
                  value={settings.instagramUrl}
                  onChange={e => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-white/70 uppercase">Modelo de Mensagem Automática do Pedido:</label>
                <textarea
                  rows={5}
                  value={settings.whatsappMessageTemplate}
                  onChange={e => setSettings(prev => ({ ...prev, whatsappMessageTemplate: e.target.value }))}
                  className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-[14px] p-3 text-white font-mono outline-none"
                />
                <span className="text-[10px] text-white/40 block">
                  Coringas disponíveis: &#123;nome&#125; para o nome do produto e &#123;preco&#125; para o valor formatado.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Featured Products & Categories Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Featured Categories Card */}
          <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF4FA0]" />
                <h3 className="text-xs font-bold uppercase text-white font-mono-custom">
                  Categorias Exibidas na Home
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map(cat => {
                const isSelected = settings.featuredCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleFeaturedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono-custom transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B0D4E]/50 border-[#EC0E78] text-white'
                        : 'bg-[#111113] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4FA0]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Products Selection */}
          <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF4FA0]" />
                <h3 className="text-xs font-bold uppercase text-white font-mono-custom">
                  Produtos em Destaque VIP
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {products.map(prod => {
                const isSelected = settings.featuredProductIds.includes(prod.id);
                return (
                  <button
                    key={prod.id}
                    onClick={() => toggleFeaturedProduct(prod.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono-custom transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B0D4E]/50 border-[#EC0E78] text-white'
                        : 'bg-[#111113] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="text-left truncate max-w-[200px]">
                      <span className="block font-bold text-white truncate">{prod.name}</span>
                      <span className="text-[10px] text-[#FF4FA0]">R$ {prod.sell_price.toFixed(2)}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#FF4FA0]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSaveSettings}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.02] text-white font-extrabold text-xs uppercase tracking-wider rounded-[18px] shadow-[0_8px_24px_rgba(236,14,120,0.5)] transition-all duration-200 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
              <span>{savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#18181A] border border-white/15 rounded-[24px] max-w-sm w-full p-6 text-center space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase font-mono-custom">QR Code do Catálogo</h3>
              <button onClick={() => setShowQrModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            {/* Generated QR Code representation */}
            <div className="bg-white p-6 rounded-2xl mx-auto inline-block shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(catalogFullUrl)}`}
                alt="QR Code Catálogo Pink Pulse"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-white/70 font-mono-custom">
              Escaneie com a câmera do celular para abrir a vitrine virtual da Pink Pulse.
            </p>

            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(catalogFullUrl)}`;
                link.download = 'qrcode-catalogo-pink-pulse.png';
                link.target = '_blank';
                link.click();
              }}
              className="w-full py-3 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
            >
              Baixar QR Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicCatalogAdmin;
