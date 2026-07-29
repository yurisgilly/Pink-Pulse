'use client';

import React from 'react';
import { useERP } from '@/contexts/erp.context';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, UserX, ShoppingBag, ArrowUpRight, ShieldAlert, Sparkles, Gift 
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { dashboardMetrics, alerts, loading, setActiveTab, products } = useERP();

  if (loading || !dashboardMetrics) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]" id="dashboard-loading">
        <div className="w-12 h-12 rounded-full border-4 border-pink-100/10 border-t-[#E6007E] animate-spin" />
        <p className="text-sm text-gray-500 font-sans mt-4">Calculando métricas em tempo real...</p>
      </div>
    );
  }
  const COLORS = ['#E6007E', '#ff4fa0', '#a40d58', '#f472b6', '#3b0722'];

  const metricsData = [
    { id: 'revenue', title: 'Faturamento Total', value: `R$ ${dashboardMetrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: '+12.4% este mês', icon: DollarSign, bg: 'bg-[rgba(230,0,126,0.1)] text-[#E6007E]' },
    { id: 'profit', title: 'Lucro Líquido Real', value: `R$ ${dashboardMetrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: 'Margem média ~62%', icon: TrendingUp, bg: 'bg-[rgba(164,13,88,0.15)] text-[#ff4fa0]' },
    { id: 'stock-cost', title: 'Capital em Estoque', value: `R$ ${dashboardMetrics.totalStockCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: `${products.length} produtos cadastrados`, icon: Package, bg: 'bg-[rgba(242,239,235,0.05)] text-[#f2efeb]/80' },
    { id: 'debts', title: 'Contas a Receber (Fiado)', value: `R$ ${dashboardMetrics.totalDebtsOutstanding.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, sub: `${dashboardMetrics.lowStockCount} alertas ativos`, icon: UserX, bg: 'bg-[rgba(251,191,36,0.1)] text-amber-500' },
  ];

  return (
    <div className="space-y-10 animate-fade-in text-[#f2efeb]" id="dashboard-screen">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6" id="dashboard-welcome">
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-[#f2efeb] uppercase text-[#E6007E]">Painel Executivo</h1>
          <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Visão geral em tempo real do ERP Pink Pulse.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#18181A] border border-[rgba(242,239,235,0.1)] text-[11px] text-[#f2efeb]/80 font-mono-custom uppercase tracking-wider rounded-[4px]">
          <Sparkles className="w-4 h-4 text-[#E6007E]" />
          <span>Faturamento Diário: <strong className="text-[#E6007E]">R$ 1.840,00</strong></span>
        </div>
      </div>

      {/* Birthday Banner */}
      {(() => {
        const birthdayAlertsCount = (alerts || []).filter(a => a.type === 'birthday').length;
        if (birthdayAlertsCount === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-[#1F0D19] via-[#2A1021] to-[#18181A] border border-[#EC0E78]/40 rounded-[22px] flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_20px_rgba(236,14,120,0.15)]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#EC0E78]/20 border border-[#EC0E78]/30 text-[#EC0E78] rounded-[16px] shadow-[0_0_12px_rgba(236,14,120,0.3)]">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <span>🎂 Aniversariantes deste Mês</span>
                  <span className="px-2 py-0.5 bg-[#EC0E78] text-white text-[10px] font-mono-custom rounded-full">
                    {birthdayAlertsCount}
                  </span>
                </h4>
                <p className="text-xs text-white/70 font-mono-custom uppercase tracking-wider mt-1">
                  Clientes fazendo aniversário este mês. Envie felicitações ou presenteie com o cupom VIP PARABENS10!
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-5 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.02] text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] transition-all cursor-pointer"
            >
              Ver no Feed de Alertas
            </button>
          </motion.div>
        );
      })()}

      {/* Grid de Cards Metálicos Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics-grid">
        {metricsData.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">{m.title}</span>
                <div className={`w-10 h-10 ${m.bg} flex items-center justify-center font-bold rounded-[4px]`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-2xl font-display font-extrabold tracking-tight text-[#f2efeb]">{m.value}</h3>
                <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#E6007E] rounded-full animate-pulse" />
                  {m.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Seção de Gráficos de Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        {/* Gráfico de Tendências (2 Colunas) */}
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Histórico de Performance Financeira</h3>
              <p className="text-[11px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Faturamento vs Lucro Líquido no semestre atual.</p>
            </div>
            <span className="text-[10px] font-mono-custom font-bold text-[#E6007E] border border-[#E6007E]/30 px-3 py-1 uppercase tracking-wider rounded-[4px]">
              Sincronizado
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardMetrics.monthlySalesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#E6007E" stopOpacity={0.25}/>
                     <stop offset="95%" stopColor="#E6007E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a40d58" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#a40d58" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(242, 239, 235, 0.05)" />
                <XAxis dataKey="name" stroke="rgba(242, 239, 235, 0.4)" fontSize={10} fontFamily="Space Mono" tickLine={false} />
                <YAxis stroke="rgba(242, 239, 235, 0.4)" fontSize={10} fontFamily="Space Mono" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(242,239,235,0.1)', color: '#f2efeb' }} />
                <Area type="monotone" dataKey="vendas" name="Vendas (R$)" stroke="#E6007E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVendas)" />
                <Area type="monotone" dataKey="lucro" name="Lucro Líquido (R$)" stroke="#a40d58" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLucro)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Categorias (1 Coluna) */}
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Vendas por Categoria</h3>
            <p className="text-[11px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Participação no faturamento atual.</p>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center relative my-4">
            {dashboardMetrics.salesByCategory.length === 0 ? (
              <p className="text-xs text-[#f2efeb]/40 font-mono-custom">Nenhuma venda realizada.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardMetrics.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dashboardMetrics.salesByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `R$ ${val.toFixed(2)}`} contentStyle={{ backgroundColor: '#111113', borderColor: 'rgba(242,239,235,0.1)', color: '#f2efeb' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-bold text-[#f2efeb]/40 uppercase tracking-widest font-mono-custom">ATIVAS</span>
              <span className="text-sm font-bold text-[#f2efeb] font-mono-custom">{dashboardMetrics.salesByCategory.length} cats</span>
            </div>
          </div>

          {/* Legenda Customizada */}
          <div className="space-y-2 pt-2 border-t border-[rgba(242,239,235,0.05)]" id="dashboard-categories-legend">
            {dashboardMetrics.salesByCategory.map((cat: any, index: number) => (
              <div key={cat.name} className="flex items-center justify-between text-[11px] font-mono-custom uppercase tracking-wider text-[#f2efeb]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{cat.name}</span>
                </div>
                <span className="font-bold text-[#f2efeb]">R$ {cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé do Dashboard: Produtos mais vendidos */}
      <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6" id="dashboard-top-products">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Produtos Campeões de Vendas</h3>
            <p className="text-[11px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider mt-1">Produtos de maior saída no período de controle.</p>
          </div>
          <button
            id="btn-goto-pdv"
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-2 px-4 py-2 border border-[#E6007E] hover:bg-[#E6007E]/10 text-[#E6007E] transition-all text-[11px] font-mono-custom uppercase tracking-widest font-bold rounded-[4px] cursor-pointer"
          >
            Fazer Nova Venda
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="table-top-products">
            <thead>
              <tr className="border-b border-[rgba(242,239,235,0.1)] text-[10px] font-bold uppercase tracking-widest text-[#f2efeb]/40 font-mono-custom">
                <th className="py-3">Nome do Produto</th>
                <th className="py-3">Unidades Vendidas</th>
                <th className="py-3">Receita Gerada</th>
                <th className="py-3">Performance de Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(242,239,235,0.05)] text-xs">
              {dashboardMetrics.topProducts.map((p: any, idx: number) => (
                <tr key={p.name} className="hover:bg-[rgba(242,239,235,0.02)] transition-all text-[#f2efeb]/80">
                  <td className="py-4 font-semibold text-[#f2efeb]">{p.name}</td>
                  <td className="py-4 font-mono-custom">{p.quantity} un.</td>
                  <td className="py-4 font-mono-custom font-bold text-[#E6007E]">R$ {p.revenue.toFixed(2)}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-[rgba(242,239,235,0.05)] h-1.5 rounded-[4px]">
                        <div 
                          className="bg-[#E6007E] h-full" 
                          style={{ width: `${Math.min(100, (p.quantity / 50) * 100)}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-mono-custom uppercase font-bold text-[#f2efeb]/40">EXCELENTE</span>
                    </div>
                  </td>
                </tr>
              ))}
              {dashboardMetrics.topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#f2efeb]/40 font-mono-custom">Nenhuma venda registrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
