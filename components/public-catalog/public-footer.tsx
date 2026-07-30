'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/sem coraçao.png';
import { MessageCircle, Instagram, Lock, ShieldCheck, Heart } from 'lucide-react';
import { PublicCatalogSettings } from '@/types/public-catalog.types';

interface PublicFooterProps {
  settings: PublicCatalogSettings;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ settings }) => {
  const whatsappNumber = settings.whatsappNumber || '24999092402';

  return (
    <footer className="bg-[#0A070B] border-t border-white/10 text-white pt-12 pb-8 mt-16 relative overflow-hidden">
      
      {/* Background Accent Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#EC0E78]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <Image 
                src={logoImg} 
                alt="Pink Pulse Logo" 
                className="w-[170px] h-auto object-contain drop-shadow-[0_0_12px_rgba(236,14,120,0.4)] -mt-[18px] ml-0 md:-ml-[11px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2.5 text-xs text-white/80 max-w-lg leading-relaxed">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider text-[#FF4FA0]">
                Quem Somos
              </h4>
              <p>
                Na Pink Pulse, acreditamos que desejo, prazer e conexão fazem parte de uma vida mais leve, íntima e feliz. Somos um sex shop moderno, criado para oferecer produtos de alta qualidade, com inovação, segurança e muito cuidado em cada escolha.
              </p>
              <p>
                Mais do que vender produtos, queremos proporcionar experiências que despertam a autoestima, o bem-estar e a cumplicidade, sempre respeitando o seu tempo e as suas preferências.
              </p>
              <p>
                E para que tudo seja ainda mais confortável, prezamos pelo sigilo e pela discrição em cada atendimento e envio, garantindo que nossos clientes tenham uma experiência segura, acolhedora e sem tabus.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#FF4FA0]">
              <Heart className="w-4 h-4 fill-current" />
              <span>Desejo • Prazer • Conexão.</span>
            </div>
          </div>

          {/* Direct Contact Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
              Atendimento VIP
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80 font-medium">
              <li>
                <a
                  href={`https://wa.me/55${whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#FF4FA0] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: (24) 99909-2402</span>
                </a>
              </li>

              {settings.instagramUrl && (
                <li>
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#FF4FA0] transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-[#FF4FA0]" />
                    <span>@lojapinkpulse</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Privacy & Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
              Compromisso e Sigilo
            </h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#FF4FA0] shrink-0 mt-0.5" />
                <span>Embalagem 100% descaracterizada e sigilosa.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Atendimento humano e exclusivo via WhatsApp.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Pink Pulse. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span>Catálogo Público VIP</span>
              <span>•</span>
              <span className="text-[#FF4FA0]">Pink Pulse</span>
            </span>
            <span className="text-white/20">|</span>
            <Link
              href="/login"
              className="text-white/40 hover:text-[#FF4FA0] transition-colors font-mono uppercase text-[10px] tracking-wider"
            >
              Área Administrativa
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
