'use client';

import React from 'react';
import { useERP } from '@/contexts/erp.context';
import { SalesRepository } from '@/repositories/sales.repository';
import { 
  DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, UserX, PiggyBank, RefreshCw 
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { debts, sales, dashboardMetrics, loading, refreshAll } = useERP();

  const handlePayDebt = async (debtId: string) => {
    const success = await SalesRepository.payDebt(debtId);
    if (success) {
      alert('Pagamento de débito (crediário) processado com sucesso. Caixa atualizado!');
      refreshAll();
    } else {
      alert('Falha ao processar pagamento.');
    }
  };

  if (loading || !dashboardMetrics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]" id="finance-loading">
        <div className="w-10 h-10 border-4 border-[rgba(242,239,235,0.05)] border-t-[#E6007E] rounded-full animate-spin" />
        <p className="text-xs text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-4">Compilando fluxo de caixa do Supabase...</p>
      </div>
    );
  }

  const outstandingDebts = debts.filter(d => !d.paid);
  const paidDebts = debts.filter(d => d.paid);

  return (
    <div className="space-y-10 animate-fade-in text-[#f2efeb]" id="finance-screen">
      {/* Title */}
      <div className="flex items-center justify-between" id="finance-header">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight uppercase text-[#E6007E]">Tesouraria & Caixa</h2>
          <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Controle de faturamento, liquidez e recebíveis de inadimplência.</p>
        </div>
      </div>

      {/* Grid of Finance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finance-cards">
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-custom font-bold text-[#f2efeb]/40 uppercase tracking-widest">Faturamento do Mês</span>
            <div className="w-9 h-9 rounded-[4px] bg-[rgba(242,239,235,0.05)] text-[#E6007E] flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono-custom text-[#f2efeb]">R$ {dashboardMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Soma de todas as vendas aprovadas.</p>
          </div>
        </div>

        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-custom font-bold text-[#f2efeb]/40 uppercase tracking-widest">Lucro Operacional Líquido</span>
            <div className="w-9 h-9 rounded-[4px] bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono-custom text-emerald-400">R$ {dashboardMetrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Abatendo custos proporcionais de compra.</p>
          </div>
        </div>

        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono-custom font-bold text-[#f2efeb]/40 uppercase tracking-widest">Contas a Receber (Fiados)</span>
            <div className="w-9 h-9 rounded-[4px] bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono-custom text-amber-400">R$ {dashboardMetrics.totalDebtsOutstanding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Total pendente de pagamento em aberto.</p>
          </div>
        </div>
      </div>

      {/* Grid: Outstanding debts vs Cash flow history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="finance-split-grid">
        {/* Outstanding debts list */}
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-6">
          <div>
            <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Contas em Aberto (Devedores)</h3>
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Carteiras de crediário que precisam de quitação.</p>
          </div>

          <div className="space-y-3 animate-fade-in" id="outstanding-debts-list">
            {outstandingDebts.map(d => (
              <div 
                key={d.id}
                className="p-4 bg-amber-500/5 border border-amber-500/10 flex items-center justify-between text-xs rounded-[4px]"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-[#f2efeb]">{d.customer_name}</span>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold font-mono-custom uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-none">PENDENTE</span>
                  </div>
                  <p className="text-[#f2efeb]/40 font-mono-custom text-[10px] uppercase">Vencimento: {d.due_date.split('-').reverse().join('/')}</p>
                  <p className="text-[#f2efeb]/30 font-mono-custom text-[9px] uppercase mt-1">Venda Origem: #{d.sale_id.split('-')[0].toUpperCase()}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono-custom font-bold text-sm text-amber-400">R$ {d.amount.toFixed(2)}</span>
                  <button
                    id={`btn-pay-debt-${d.id}`}
                    onClick={() => handlePayDebt(d.id)}
                    className="px-3 py-1.5 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-white font-mono-custom text-[10px] font-bold uppercase tracking-widest transition-all rounded-[4px] cursor-pointer"
                  >
                    Quitar Fatura
                  </button>
                </div>
              </div>
            ))}
            {outstandingDebts.length === 0 && (
              <div className="text-center py-12 text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider text-xs flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <span>Excelente! Caixa 100% adimplente. Nenhuma conta atrasada.</span>
              </div>
            )}
          </div>
        </div>

        {/* Cash flow payments history */}
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-6">
          <div>
            <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Histórico de Quitações / Caixa</h3>
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Últimos créditos recebidos e faturados.</p>
          </div>

          <div className="divide-y divide-[rgba(242,239,235,0.05)] max-h-[320px] overflow-y-auto pr-1" id="cash-flow-history">
            {paidDebts.map(d => (
              <div key={d.id} className="flex items-center justify-between py-3.5 text-xs">
                <div>
                  <span className="font-bold text-[#f2efeb] block">Recebimento: {d.customer_name}</span>
                  <span className="text-[10px] text-[#f2efeb]/40 font-mono-custom block mt-1 font-bold uppercase tracking-wider">ID Quitação: #{d.id.split('-')[0].toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono-custom font-bold text-emerald-400 block">+ R$ {d.amount.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono-custom uppercase tracking-wider flex items-center justify-end gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Liquidado
                  </span>
                </div>
              </div>
            ))}
            {paidDebts.length === 0 && (
              <div className="text-center py-12 text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider text-xs">Nenhum pagamento histórico registrado neste período.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinanceView;
