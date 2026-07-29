'use client';

import React, { useState } from 'react';
import { 
  X, FileText, Image as ImageIcon, Share2, MessageCircle, Mail, Send, Download, Check 
} from 'lucide-react';

interface ExportCatalogModalProps {
  onClose: () => void;
  onOpenOverview: (format?: 'pdf' | 'jpg' | 'png') => void;
}

export const ExportCatalogModal: React.FC<ExportCatalogModalProps> = ({
  onClose,
  onOpenOverview,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExportFormat = () => {
    // Opens Visão Geral view and automatically initiates export for selected format
    onOpenOverview(selectedFormat);
    onClose();
  };

  const handleShareWhatsApp = () => {
    const text = `💗 *Catálogo Pink Pulse ERP*\n\nConfira nosso catálogo digital atualizado com lançamentos e produtos disponíveis:\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = 'Catálogo Pink Pulse';
    const body = `Olá!\n\nAcesse nosso catálogo digital completo no link abaixo:\n${window.location.href}\n\nPink Pulse ERP`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = 'Confira o Catálogo Digital Pink Pulse ERP:';
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveFile = () => {
    handleExportFormat();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-[#f2efeb]">
      <div className="bg-[#18181A] border border-[#ECEEF5]/15 rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.6)] relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-[#8B0D4E] to-[#A40D58] text-white rounded-[14px] shadow-md">
              <Share2 className="w-5 h-5 text-[#FF4FA0]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold font-display text-white uppercase tracking-tight">
                EXPORTAR CATÁLOGO
              </h3>
              <p className="text-xs text-white/60 font-mono-custom uppercase tracking-wider">
                Gere e compartilhe o catálogo oficial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-600/30 text-white rounded-[12px] transition-all cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Exportar Catálogo Formats */}
        <div className="space-y-3">
          <label className="text-xs font-mono-custom uppercase tracking-wider text-[#FF4FA0] font-bold block">
            EXPORTAR CATÁLOGO
          </label>

          <div className="space-y-2 bg-[#111113] border border-white/10 p-3 rounded-[18px]">
            <label 
              onClick={() => setSelectedFormat('pdf')}
              className={`flex items-center justify-between p-3 rounded-[14px] border cursor-pointer transition-all ${
                selectedFormat === 'pdf'
                  ? 'bg-[#EC0E78]/15 border-[#EC0E78] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 text-xs font-mono-custom uppercase">
                <FileText className="w-4 h-4 text-[#FF4FA0]" />
                <span>PDF (Documento Impresso / Apresentação)</span>
              </div>
              <input 
                type="radio" 
                name="export_format" 
                checked={selectedFormat === 'pdf'} 
                onChange={() => setSelectedFormat('pdf')}
                className="accent-[#EC0E78] cursor-pointer"
              />
            </label>

            <label 
              onClick={() => setSelectedFormat('jpg')}
              className={`flex items-center justify-between p-3 rounded-[14px] border cursor-pointer transition-all ${
                selectedFormat === 'jpg'
                  ? 'bg-[#EC0E78]/15 border-[#EC0E78] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 text-xs font-mono-custom uppercase">
                <ImageIcon className="w-4 h-4 text-[#FF4FA0]" />
                <span>JPG (Imagem em Alta Resolução)</span>
              </div>
              <input 
                type="radio" 
                name="export_format" 
                checked={selectedFormat === 'jpg'} 
                onChange={() => setSelectedFormat('jpg')}
                className="accent-[#EC0E78] cursor-pointer"
              />
            </label>

            <label 
              onClick={() => setSelectedFormat('png')}
              className={`flex items-center justify-between p-3 rounded-[14px] border cursor-pointer transition-all ${
                selectedFormat === 'png'
                  ? 'bg-[#EC0E78]/15 border-[#EC0E78] text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 text-xs font-mono-custom uppercase">
                <ImageIcon className="w-4 h-4 text-[#FF4FA0]" />
                <span>PNG (Imagem Transparente / Digital)</span>
              </div>
              <input 
                type="radio" 
                name="export_format" 
                checked={selectedFormat === 'png'} 
                onChange={() => setSelectedFormat('png')}
                className="accent-[#EC0E78] cursor-pointer"
              />
            </label>
          </div>

          <button
            onClick={handleExportFormat}
            className="w-full py-3 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[16px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Gerar {selectedFormat.toUpperCase()} do Catálogo</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-2" />

        {/* Section 2: Compartilhar */}
        <div className="space-y-3">
          <label className="text-xs font-mono-custom uppercase tracking-wider text-[#FF4FA0] font-bold block">
            COMPARTILHAR
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2.5 px-3.5 py-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer text-left"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareEmail}
              className="flex items-center gap-2.5 px-3.5 py-3 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer text-left"
            >
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Email</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="flex items-center gap-2.5 px-3.5 py-3 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer text-left"
            >
              <Send className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Telegram</span>
            </button>

            <button
              onClick={handleSaveFile}
              className="flex items-center gap-2.5 px-3.5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer text-left"
            >
              <Download className="w-4 h-4 text-[#FF4FA0] shrink-0" />
              <span>Salvar arquivo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
