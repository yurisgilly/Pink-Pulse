'use client';

import React, { useState, useEffect } from 'react';
import { CatalogReview, ReviewStatus } from '@/types/public-catalog.types';
import { getAllCatalogReviews, updateCatalogReviewStatus, deleteCatalogReview } from '@/lib/catalog-analytics';
import { MessageSquare, Star, CheckCircle2, EyeOff, Trash2, Shield, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const CatalogReviewsModerationAdmin: React.FC = () => {
  const [reviews, setReviews] = useState<CatalogReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'hidden'>('pending');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllCatalogReviews();
      setReviews(data);
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllCatalogReviews();
        if (mounted) {
          setReviews(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar comentários:', err);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReviewStatus) => {
    try {
      await updateCatalogReviewStatus(id, newStatus);
      const statusLabels = {
        approved: 'aprovada e já está visível no catálogo!',
        hidden: 'ocultada do catálogo.',
        pending: 'marcada como aguardando aprovação.'
      };
      setActionSuccessMessage(`Avaliação ${statusLabels[newStatus]}`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      loadReviews();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação permanentemente?')) return;
    try {
      await deleteCatalogReview(id);
      setActionSuccessMessage('Avaliação excluída com sucesso.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      loadReviews();
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const hiddenCount = reviews.filter(r => r.status === 'hidden').length;

  const filteredReviews = reviews.filter(r => {
    if (filterTab === 'pending') return r.status === 'pending';
    if (filterTab === 'approved') return r.status === 'approved';
    if (filterTab === 'hidden') return r.status === 'hidden';
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="p-6 bg-[#18181A] border border-white/10 rounded-[22px] shadow-xl space-y-6 text-white">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-[#8B0D4E] to-[#EC0E78] text-white rounded-xl shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase text-white font-mono-custom">
                Moderação de Comentários & Avaliações
              </h3>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold rounded-full animate-pulse">
                  {pendingCount} Pendente{pendingCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 font-mono-custom">
              Gerencie os depoimentos enviados pelos clientes. Somente avaliações aprovadas aparecem no catálogo público.
            </p>
          </div>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono-custom rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FF4FA0] ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Toast Alert Feedback */}
      {actionSuccessMessage && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono-custom flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-custom font-bold uppercase transition-all cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-amber-500/20 border border-amber-500 text-amber-300 shadow-sm'
              : 'bg-[#111113] border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Aguardando Aprovação ({pendingCount})</span>
        </button>

        <button
          onClick={() => setFilterTab('approved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-custom font-bold uppercase transition-all cursor-pointer ${
            filterTab === 'approved'
              ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 shadow-sm'
              : 'bg-[#111113] border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Aprovadas ({approvedCount})</span>
        </button>

        <button
          onClick={() => setFilterTab('hidden')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-custom font-bold uppercase transition-all cursor-pointer ${
            filterTab === 'hidden'
              ? 'bg-rose-500/20 border border-rose-500 text-rose-300 shadow-sm'
              : 'bg-[#111113] border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
          <span>Ocultadas ({hiddenCount})</span>
        </button>

        <button
          onClick={() => setFilterTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono-custom font-bold uppercase transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#8B0D4E]/50 border border-[#EC0E78] text-white shadow-sm'
              : 'bg-[#111113] border border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-[#FF4FA0]" />
          <span>Todas ({reviews.length})</span>
        </button>
      </div>

      {/* Reviews Table / List */}
      {loading ? (
        <div className="py-8 text-center text-xs font-mono-custom text-white/50">
          Carregando lista de moderação...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-8 text-center bg-[#111113] border border-white/5 rounded-2xl p-6 text-xs text-white/50 font-mono-custom">
          Nenhuma avaliação encontrada nesta categoria de filtro.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isApproved = rev.status === 'approved';
            const isPending = rev.status === 'pending';
            const isHidden = rev.status === 'hidden';

            return (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPending
                    ? 'bg-amber-950/10 border-amber-500/30'
                    : isApproved
                    ? 'bg-emerald-950/10 border-emerald-500/20'
                    : 'bg-[#111113] border-white/10 opacity-75'
                }`}
              >
                {/* Reviewer Details & Content */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-sm text-white font-mono-custom">
                      {rev.name}
                    </span>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 text-[#FF4FA0]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 transition-all ${
                            s <= rev.rating ? 'fill-[#FF4FA0] text-[#FF4FA0] drop-shadow-[0_0_6px_rgba(255,79,160,0.8)]' : 'text-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full font-mono-custom ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isPending ? '⏳ Aguardando Aprovação' : isApproved ? '✅ Aprovado' : '👁️ Oculto'}
                    </span>

                    <span className="text-[10px] text-white/40 font-mono-custom ml-auto sm:ml-0">
                      {formatDate(rev.created_at)}
                    </span>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-white/90 font-sans leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Moderation Actions (Aprovar, Ocultar, Excluir) */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                  
                  {/* Aprovar Button */}
                  {!isApproved && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono-custom font-bold uppercase rounded-xl transition-all cursor-pointer"
                      title="Aprovar comentário para aparecer no catálogo"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Aprovar</span>
                    </button>
                  )}

                  {/* Ocultar Button */}
                  {!isHidden && (
                    <button
                      onClick={() => handleStatusChange(rev.id, 'hidden')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white text-xs font-mono-custom font-bold uppercase rounded-xl transition-all cursor-pointer"
                      title="Ocultar comentário do catálogo público"
                    >
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      <span>Ocultar</span>
                    </button>
                  )}

                  {/* Excluir Button */}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
                    title="Excluir avaliação permanentemente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
