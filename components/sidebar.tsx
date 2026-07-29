'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useERP, ActiveTab } from '@/contexts/erp.context';
import logoImg from '@/assets/sem coraçao.png';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FileText,
  Boxes, 
  BookOpen,
  Globe,
  Users, 
  CreditCard, 
  BarChart3, 
  Sparkles, 
  Shield, 
  Truck,
  LogOut 
} from 'lucide-react';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, alerts, supabaseConnected, currentUser, logout } = useERP();
  const router = useRouter();

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { id: 'sales' as ActiveTab, label: 'Frente de Caixa', icon: ShoppingBag, route: '/vendas' },
    { id: 'receipts' as ActiveTab, label: 'Comprovantes', icon: FileText, route: '/comprovantes' },
    { id: 'stock' as ActiveTab, label: 'Estoque', icon: Boxes, route: '/estoque' },
    { id: 'catalog' as ActiveTab, label: 'Catálogo ERP', icon: BookOpen, route: '/estoque' },
    { id: 'public_catalog' as ActiveTab, label: 'Catálogo Público', icon: Globe, route: '/catalogo-admin' },
    { id: 'customers' as ActiveTab, label: 'Clientes', icon: Users, route: '/clientes' },
    { id: 'debts' as ActiveTab, label: 'Controle de Fiados', icon: CreditCard, route: '/fiados' },
    { id: 'reports' as ActiveTab, label: 'Relatórios', icon: BarChart3, route: '/relatorios' },
    { id: 'ai' as ActiveTab, label: 'Feed de Alertas', icon: Sparkles, badge: alerts.length, route: '/alertas' },
    { id: 'suppliers' as ActiveTab, label: 'Fornecedores', icon: Truck, route: '/fornecedores' },
    { id: 'users' as ActiveTab, label: 'Usuários', icon: Shield, route: '/usuarios' },
  ];

  const userInitials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PP';

  return (
    <aside 
      id="sidebar-container"
      className={`fixed top-0 left-0 h-screen w-[260px] bg-gradient-to-b from-[#18181A] via-[#1F0D19] to-[#8B0D4E] text-[#f2efeb] flex flex-col justify-between py-6 px-4 z-50 lg:z-30 border-r border-[rgba(242,239,235,0.1)] shadow-[4px_0_24px_rgba(0,0,0,0.3)] overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div>
        {/* Logo Section */}
        <div id="sidebar-logo" className="flex items-center justify-center mb-6 border-b border-[rgba(242,239,235,0.1)] pb-4 overflow-hidden">
          <div className="relative w-full h-[170px] flex items-center justify-center">
            <Image 
              src={logoImg} 
              alt="Pink Pulse Logo" 
              className="object-contain max-h-[300px] w-full h-auto scale-105 hover:scale-110 transition-transform duration-300"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5" id="sidebar-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.route) {
                    router.push(item.route);
                  }
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] transition-all duration-200 group text-left cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-bold shadow-[0_4px_14px_rgba(236,14,120,0.4)] scale-[1.01]' 
                    : 'text-[#f2efeb]/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white' : 'text-[#f2efeb]/60 group-hover:text-white group-hover:scale-110'}`} />
                  <span className="text-xs font-semibold tracking-wide uppercase font-mono-custom">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[9px] font-mono-custom font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#EC0E78]' : 'bg-[#EC0E78] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Footer Section */}
      <div className="pt-4 border-t border-[rgba(242,239,235,0.1)] space-y-3 mt-6" id="sidebar-footer">
        <div className="px-3 py-2 rounded-[10px] bg-black/20 border border-white/10 flex items-center justify-between text-[10px] font-mono-custom">
          <span className="text-[#f2efeb]/50">SISTEMA:</span>
          {supabaseConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              NUVEM SQL
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#EC0E78] font-bold uppercase">
              <span className="w-2 h-2 bg-[#EC0E78] rounded-full" />
              DEMO LOCAL
            </span>
          )}
        </div>
 
        <div className="flex items-center gap-3 px-1">
          {currentUser?.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shadow-sm relative shrink-0">
              <Image 
                src={currentUser.avatar_url} 
                alt={currentUser.name}
                width={250}
                height={250}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EC0E78] to-[#FF4FA0] text-white flex items-center justify-center font-extrabold text-xs tracking-tight font-display uppercase border border-white/20 shadow-sm shrink-0">
              {userInitials}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white tracking-tight leading-tight truncate">{currentUser?.name || 'Operador'}</h4>
            <p className="text-[9px] text-[#f2efeb]/60 font-mono-custom uppercase tracking-wider truncate">{currentUser?.role || 'Acesso'}</p>
          </div>
        </div>
 
        <button
          id="btn-close-shift"
          onClick={async () => {
            if (confirm('Deseja realmente encerrar seu turno e desconectar do ERP?')) {
              await logout();
              router.push('/login');
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-rose-600/30 hover:text-white border border-white/15 hover:border-rose-400 text-[#f2efeb]/80 transition-all duration-200 font-mono-custom text-[10px] font-bold uppercase tracking-widest rounded-[10px] cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Encerrar Turno
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
