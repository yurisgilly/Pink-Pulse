'use client';

import React from 'react';
import { useERP } from '@/contexts/erp.context';
import { ProductsRepository } from '@/repositories/products.repository';
import { 
  AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Bell, Gift, Sparkles, Copy, MessageCircle 
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, customers, refreshAll, loading } = useERP();

  const handleResolveAlert = async (id: string) => {
    if (id.startsWith('bday-')) {
      try {
        const saved = JSON.parse(localStorage.getItem('pink_pulse_resolved_birthday_alerts') || '[]');
        if (!saved.includes(id)) {
          saved.push(id);
          localStorage.setItem('pink_pulse_resolved_birthday_alerts', JSON.stringify(saved));
        }
      } catch (e) {
        console.error(e);
      }
      refreshAll();
    } else {
      const success = await ProductsRepository.resolveAlert(id);
      if (success) {
        refreshAll();
      }
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Cupom "${code}" copiado para a área de transferência!`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#f2efeb] max-w-5xl mx-auto" id="alerts-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#18181A] p-6 rounded-[22px] border border-[#ECEEF5]/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)]" id="alerts-feed-header">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#EC0E78]/10 rounded-[16px] border border-[#EC0E78]/20 text-[#EC0E78]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-white">Feed de Alertas</h2>
            <p className="text-xs text-[#64748B] font-mono-custom uppercase tracking-wider mt-1">Alertas em tempo real de estoque mínimo, aniversariantes do mês e finanças.</p>
          </div>
        </div>

        <button
          id="btn-sync-alerts"
          onClick={refreshAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[16px] transition-all text-xs font-mono-custom font-bold uppercase text-[#f2efeb] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#EC0E78]' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4" id="alerts-list">
        {alerts.map(a => {
          const isBirthday = a.type === 'birthday';
          const isDanger = a.severity === 'danger' && !isBirthday;
          const isWarning = a.severity === 'warning' && !isBirthday;
          
          const relatedCustomer = isBirthday ? customers.find(c => c.id === a.related_id) : null;
          const cleanPhone = relatedCustomer?.phone?.replace(/\D/g, '');
          const whatsappUrl = cleanPhone 
            ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${relatedCustomer?.name || 'Cliente VIP'}! A equipe Pink Pulse te deseja um feliz aniversário! Para comemorar seu mês especial, presenteamos você com 10% de desconto em nossos produtos! `)}`
            : null;

          return (
            <div 
              key={a.id}
              className={`p-6 rounded-[22px] border transition-all flex items-start gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] ${
                isBirthday
                  ? 'bg-gradient-to-r from-[#1F0D19] via-[#2A1021] to-[#18181A] border-[#EC0E78]/40 text-white shadow-[0_4px_20px_rgba(236,14,120,0.2)]'
                  : isDanger 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-100' 
                  : isWarning 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-100' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-100'
              }`}
            >
              <div className={`p-3 rounded-[16px] flex-shrink-0 ${
                isBirthday 
                  ? 'bg-[#EC0E78]/20 text-[#EC0E78] border border-[#EC0E78]/30 shadow-[0_0_12px_rgba(236,14,120,0.3)]'
                  : isDanger 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : isWarning 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {isBirthday ? <Gift className="w-6 h-6 animate-pulse" /> : isDanger ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono-custom font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                    isBirthday 
                      ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white shadow-[0_2px_10px_rgba(236,14,120,0.4)]'
                      : isDanger 
                      ? 'bg-rose-500/20 text-rose-300' 
                      : isWarning 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {isBirthday ? '🎂 ANIVERSARIANTE DO MÊS' : a.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-white/50 font-mono-custom">
                    {new Date(a.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                
                <p className="text-sm font-semibold leading-relaxed text-white">{a.message}</p>
                
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  {isBirthday && (
                    <>
                      <button
                        onClick={() => handleCopyCoupon('PARABENS10')}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase tracking-wider transition-all rounded-[12px] cursor-pointer"
                        title="Copiar cupom de desconto"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#FF4FA0]" />
                        <span>Cupom PARABENS10</span>
                      </button>

                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono-custom text-xs font-bold uppercase tracking-wider transition-all rounded-[12px] cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enviar Parabéns WhatsApp</span>
                        </a>
                      )}
                    </>
                  )}

                  <button
                    id={`btn-resolve-alert-${a.id}`}
                    onClick={() => handleResolveAlert(a.id)}
                    className="px-4 py-2 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase tracking-wider transition-all rounded-[14px] shadow-[0_4px_12px_rgba(236,14,120,0.3)] cursor-pointer"
                  >
                    Marcar como Lido
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="p-12 text-center bg-[#18181A] rounded-[22px] border border-[#ECEEF5]/10 text-white/60 text-sm flex flex-col items-center gap-3 font-mono-custom uppercase tracking-wider shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
            <span className="font-bold text-white text-base">Excelente! Nenhum alerta ativo.</span>
            <span className="text-xs text-white/40">Todas as operações de estoque, aniversariantes e finanças estão em dia.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;

