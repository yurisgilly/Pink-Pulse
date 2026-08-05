'use client';

import React, { useState, useEffect } from 'react';
import { CatalogViewStats } from '@/types/public-catalog.types';
import { getCatalogViewStats } from '@/lib/catalog-analytics';
import { Eye, Calendar, TrendingUp, BarChart3, RefreshCw, Clock } from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export const CatalogViewStatsAdmin: React.FC = () => {
  const [stats, setStats] = useState<CatalogViewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getCatalogViewStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao recarregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCatalogViewStats();
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas de visualização:', err);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-6 text-white">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl border border-[#EC0E78]/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-white font-mono-custom flex items-center gap-2">
              Estatísticas de Visualização do Catálogo Público
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded-full">
                Exclusivo Admin
              </span>
            </h3>
            <p className="text-xs text-white/60 font-mono-custom">
              Métricas em tempo real de contagem de acessos obtidas diretamente do Supabase.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono-custom rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FF4FA0] ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading && !stats ? (
        <div className="py-8 text-center text-xs font-mono-custom text-white/50">
          Carregando métricas de acesso...
        </div>
      ) : (
        <>
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Visualizações Hoje */}
            <div className="p-4 bg-[#111113] border border-white/10 rounded-xl space-y-2 hover:border-[#EC0E78]/40 transition-all">
              <div className="flex items-center justify-between text-white/60 text-[11px] font-mono-custom uppercase font-bold">
                <span>Visualizações Hoje</span>
                <Clock className="w-4 h-4 text-[#FF4FA0]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                👁️ {stats?.today.toLocaleString('pt-BR') || 0}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono-custom flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Acessos registrados hoje</span>
              </div>
            </div>

            {/* Visualizações nos Últimos 7 Dias */}
            <div className="p-4 bg-[#111113] border border-white/10 rounded-xl space-y-2 hover:border-[#EC0E78]/40 transition-all">
              <div className="flex items-center justify-between text-white/60 text-[11px] font-mono-custom uppercase font-bold">
                <span>Últimos 7 Dias</span>
                <Calendar className="w-4 h-4 text-[#FF4FA0]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                👁️ {stats?.last7Days.toLocaleString('pt-BR') || 0}
              </div>
              <div className="text-[10px] text-white/50 font-mono-custom">
                Semana atual
              </div>
            </div>

            {/* Visualizações Este Mês */}
            <div className="p-4 bg-[#111113] border border-white/10 rounded-xl space-y-2 hover:border-[#EC0E78]/40 transition-all">
              <div className="flex items-center justify-between text-white/60 text-[11px] font-mono-custom uppercase font-bold">
                <span>Este Mês</span>
                <BarChart3 className="w-4 h-4 text-[#FF4FA0]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                👁️ {stats?.thisMonth.toLocaleString('pt-BR') || 0}
              </div>
              <div className="text-[10px] text-white/50 font-mono-custom">
                Mês vigente
              </div>
            </div>

            {/* Visualizações Totais */}
            <div className="p-4 bg-[#111113] border border-white/10 rounded-xl space-y-2 hover:border-[#EC0E78]/40 transition-all">
              <div className="flex items-center justify-between text-white/60 text-[11px] font-mono-custom uppercase font-bold">
                <span>Visualizações Totais</span>
                <Eye className="w-4 h-4 text-[#FF4FA0]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#FF4FA0]">
                👁️ {stats?.total.toLocaleString('pt-BR') || 0}
              </div>
              <div className="text-[10px] text-white/50 font-mono-custom">
                Histórico acumulado
              </div>
            </div>

          </div>

          {/* Daily Views Trend Chart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-mono-custom text-white/70 uppercase">
              <span className="font-bold flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#FF4FA0]" />
                Gráfico de Visualizações Diárias (Últimos 14 Dias)
              </span>
              <span className="text-[10px] text-white/40">Sincronizado</span>
            </div>

            <div className="h-56 bg-[#111113] border border-white/10 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC0E78" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#EC0E78" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#888" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={11} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181A',
                      borderColor: '#EC0E78',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#FF4FA0', fontWeight: 'bold' }}
                    formatter={(val: any) => [`${val} visualizações`, 'Visitas']}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#EC0E78"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#viewGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
