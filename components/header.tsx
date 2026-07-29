'use client';

import React from 'react';
import { useERP } from '@/contexts/erp.context';
import { Bell, Server, Menu } from 'lucide-react';

export interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { supabaseConnected, alerts, refreshAll, loading, setActiveTab } = useERP();

  return (
    <header 
      id="top-header"
      className="h-[72px] bg-[#111113] border-b border-[rgba(242,239,235,0.1)] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 text-[#f2efeb]"
    >
      {/* Left: Operational status and Greeting */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          id="btn-mobile-menu-toggle"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-[#f2efeb]/80 hover:text-white border border-[rgba(242,239,235,0.1)] bg-white/5 rounded-[4px] cursor-pointer transition-colors"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5 text-[#E6007E]" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981] shrink-0" />
          <div>
            <h2 className="text-[10px] font-mono-custom font-extrabold text-[#E6007E] tracking-wider uppercase">
              ● SISTEMA LIVE
            </h2>
            <p className="text-[9px] text-[#f2efeb]/40 font-mono-custom uppercase mt-0.5 tracking-wider hidden sm:block">
              Pink Pulse Corp — Rio de Janeiro, BR
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions, database & Notifications */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sync Indicator */}
        <button
          id="btn-sync-erp"
          onClick={refreshAll}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-[#E6007E] text-[#111113] hover:bg-[#ff007a] transition-all text-[10px] font-mono-custom uppercase font-bold tracking-wider rounded-[4px] cursor-pointer ${
            loading ? 'opacity-60 cursor-not-allowed animate-pulse' : ''
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{loading ? 'Sincronizando...' : 'Recarregar'}</span>
        </button>

        {/* Database Status indicator */}
        <div className={`flex items-center px-2.5 sm:px-4 py-2.5 border text-[10px] font-bold font-mono-custom uppercase tracking-wider rounded-[4px] ${
          supabaseConnected 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-[#E6007E]/10 text-[#E6007E] border-[#E6007E]/20'
        }`}>
          {supabaseConnected ? 'DB: ATIVO' : 'DB: PREVIEW'}
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button 
            id="btn-notifications-toggle"
            onClick={() => setActiveTab('alerts')}
            title="Ver Feed de Alertas"
            className="w-10 h-10 border border-[rgba(242,239,235,0.1)] bg-transparent hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#EC0E78] rounded-[4px] transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>
          {alerts.length > 0 && (
            <span 
              onClick={() => setActiveTab('alerts')}
              className="absolute -top-1 -right-1 w-5 h-5 bg-[#E6007E] text-white text-[9px] font-bold font-mono-custom rounded-full flex items-center justify-center border border-[#111113] shadow-sm cursor-pointer"
            >
              {alerts.length}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
