'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ERPProvider, useERP, ActiveTab } from '@/contexts/erp.context';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

// Views
import Dashboard from '@/components/dashboard';
import StockView from '@/components/stock-view';
import SalesView from '@/components/sales-view';
import CustomersView from '@/components/customers-view';
import SuppliersView from '@/components/suppliers-view';
import FinanceView from '@/components/finance-view';
import AlertsView from '@/components/alerts-view';
import UsersView from '@/components/users-view';
import ReceiptsView from '@/components/receipts-view';
import CatalogView from '@/components/catalog-view';
import PublicCatalogAdmin from '@/components/public-catalog-admin';
import { FloatingWhatsapp } from '@/components/public-catalog/floating-whatsapp';
import { getPublicCatalogSettings } from '@/lib/public-catalog';

interface ERPAppShellProps {
  initialTab?: ActiveTab;
}

function ERPContent({ initialTab = 'dashboard' }: ERPAppShellProps) {
  const { activeTab, setActiveTab, currentUser, loading } = useERP();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync initial tab if provided and different
  useEffect(() => {
    if (initialTab && activeTab !== initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Auth Guard: Redirect to /login if unauthenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [loading, currentUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center text-xs font-mono-custom text-[#EC0E78] uppercase tracking-widest">
        <div className="w-8 h-8 rounded-full border-2 border-[#EC0E78] border-t-transparent animate-spin mb-4" />
        Carregando Painel Administrativo...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center text-xs font-mono-custom text-white/50 uppercase tracking-widest">
        Redirecionando para login...
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
      case 'promotions':
        return <SalesView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'products':
      case 'stock':
        return <StockView />;
      case 'catalog':
        return <CatalogView />;
      case 'public_catalog':
        return <PublicCatalogAdmin />;
      case 'customers':
        return <CustomersView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'finance':
      case 'debts':
      case 'reports':
        return <FinanceView />;
      case 'alerts':
      case 'ai':
        return <AlertsView />;
      case 'users':
        return <UsersView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] flex text-[#f2efeb] font-sans relative" id="erp-main-layout">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main viewport */}
      <div className="flex-1 pl-0 lg:pl-[260px] flex flex-col min-h-screen relative overflow-hidden transition-all duration-300" id="erp-body-container">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#EC0E78]/5 blur-[120px] pointer-events-none z-0" />

        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-[1500px] w-full mx-auto relative z-10" id="erp-viewport">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsapp whatsappNumber={getPublicCatalogSettings().whatsappNumber} />
    </div>
  );
}

export function ERPAppShell({ initialTab }: ERPAppShellProps) {
  return (
    <ERPProvider>
      <ERPContent initialTab={initialTab} />
    </ERPProvider>
  );
}

export default ERPAppShell;
