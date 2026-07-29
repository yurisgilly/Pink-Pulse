'use client';

import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Send, Mail, Share2 } from 'lucide-react';

interface ShareModalProps {
  title: string;
  url: string;
  text?: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  title,
  url,
  text,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = text || `Confira este produto da Pink Pulse: ${title}`;
  const encodedText = encodeURIComponent(`${shareText}\n\n${url}`);

  const whatsappShareUrl = `https://wa.me/?text=${encodedText}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#18111A] border border-white/15 rounded-[24px] max-w-md w-full p-6 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-5 text-white relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display uppercase tracking-tight">
              Compartilhar Produto
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Title Preview */}
        <p className="text-xs text-white/70 line-clamp-2 bg-[#0F0B11] p-3 rounded-xl border border-white/10">
          <span className="text-[#FF4FA0] font-bold block mb-0.5 uppercase text-[10px]">Item Selecionado:</span>
          {title}
        </p>

        {/* Direct Share Options */}
        <div className="grid grid-cols-2 gap-3">
          
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-[16px] transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="text-xs font-bold block">WhatsApp</span>
              <span className="text-[10px] text-emerald-400/70">Enviar conversa</span>
            </div>
          </a>

          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-[16px] transition-all hover:scale-[1.02]"
          >
            <Send className="w-5 h-5 text-sky-400" />
            <div className="text-left">
              <span className="text-xs font-bold block">Telegram</span>
              <span className="text-[10px] text-sky-400/70">Enviar canal</span>
            </div>
          </a>

          <a
            href={emailShareUrl}
            className="flex items-center gap-3 p-3.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 rounded-[16px] transition-all hover:scale-[1.02]"
          >
            <Mail className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <span className="text-xs font-bold block">E-mail</span>
              <span className="text-[10px] text-purple-400/70">Enviar mensagem</span>
            </div>
          </a>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-3 p-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-[16px] transition-all hover:scale-[1.02] cursor-pointer"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-[#FF4FA0]" />}
            <div className="text-left">
              <span className="text-xs font-bold block">{copied ? 'Copiado!' : 'Copiar Link'}</span>
              <span className="text-[10px] text-white/50">Área de transferência</span>
            </div>
          </button>

        </div>

        {/* Copy Input Field */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] text-white/50 uppercase font-mono">Link Direto:</label>
          <div className="flex items-center gap-2 bg-[#0F0B11] border border-white/10 rounded-xl p-2 pl-3">
            <input
              type="text"
              readOnly
              value={url}
              className="bg-transparent text-xs text-white/80 w-full outline-none font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {copied ? 'OK' : 'Copiar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
