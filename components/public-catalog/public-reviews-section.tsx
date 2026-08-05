'use client';

import React, { useState, useEffect } from 'react';
import { CatalogReview } from '@/types/public-catalog.types';
import { getApprovedCatalogReviews, submitCatalogReview } from '@/lib/catalog-analytics';
import { Star, MessageSquare, Plus, Check, X, ShieldCheck, Heart, Sparkles, Send } from 'lucide-react';

export const PublicReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CatalogReview[]>([]);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadApprovedReviews = async () => {
    try {
      const data = await getApprovedCatalogReviews();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Erro ao carregar avaliações do catálogo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getApprovedCatalogReviews();
        if (mounted) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating);
          setTotalCount(data.totalCount);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao carregar avaliações do catálogo:', err);
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome ou apelido.');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Por favor, escreva seu comentário.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await submitCatalogReview({
        name: name.trim(),
        rating,
        comment: comment.trim()
      });

      setSubmittedSuccess(true);
      setName('');
      setComment('');
      setRating(5);

      setTimeout(() => {
        setIsModalOpen(false);
        setSubmittedSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setErrorMessage('Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <section className="bg-[#18111A] border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Header with Title, Rating Summary & CTA Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#EC0E78]/20 text-[#FF4FA0] rounded-xl border border-[#EC0E78]/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-white flex items-center gap-2">
              Avaliações dos nossos clientes
            </h2>
          </div>

          {/* Average Rating Display */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#FF4FA0]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 transition-all duration-300 ${
                    star <= Math.round(averageRating)
                      ? 'fill-[#FF4FA0] text-[#FF4FA0] drop-shadow-[0_0_8px_rgba(255,79,160,0.8)] animate-pulse'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>

            <span className="text-sm font-bold text-white font-mono-custom inline-flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[#FF4FA0] text-[#FF4FA0] drop-shadow-[0_0_10px_rgba(255,79,160,0.9)] inline-block shrink-0" />
              <span>
                <strong className="text-[#FF4FA0]">{averageRating.toFixed(1)}</strong> de 5 —{' '}
                <span className="text-white/70">{totalCount} {totalCount === 1 ? 'avaliação' : 'avaliações'}</span>
              </span>
            </span>
          </div>
        </div>

        {/* CTA Button "Deixar uma avaliação" */}
        <button
          onClick={() => {
            setErrorMessage(null);
            setSubmittedSuccess(false);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_16px_rgba(236,14,120,0.4)] hover:scale-[1.02] transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Deixar uma avaliação</span>
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-8 text-center text-xs font-mono-custom text-white/50">
          Carregando avaliações...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center space-y-3 bg-[#110B13] border border-white/5 rounded-2xl p-6">
          <Sparkles className="w-8 h-8 text-[#FF4FA0] mx-auto opacity-60" />
          <p className="text-sm text-white font-bold">Seja o primeiro a deixar uma avaliação!</p>
          <p className="text-xs text-white/60 max-w-md mx-auto">
            Sua opinião é muito importante para nossa comunidade e ajuda outros clientes VIP a escolherem seus produtos favoritos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#110B13] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-[#EC0E78]/50 transition-all shadow-md"
            >
              <div className="space-y-2">
                {/* User & Rating Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B0D4E] to-[#EC0E78] text-white text-xs font-extrabold flex items-center justify-center uppercase shadow-sm font-mono-custom">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                        {rev.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[#FF4FA0] mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 transition-all duration-300 ${
                              s <= rev.rating
                                ? 'fill-[#FF4FA0] text-[#FF4FA0] drop-shadow-[0_0_6px_rgba(255,79,160,0.8)]'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-white/40 font-mono-custom">
                    {formatDate(rev.created_at)}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-white/80 font-sans leading-relaxed italic pt-1">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Verified Badge */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-emerald-400 font-mono-custom">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compra ou Acesso Verificado
                </span>
                <Heart className="w-3 h-3 text-[#FF4FA0]/60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form for Submitting Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#18181A] border border-white/15 rounded-[24px] max-w-lg w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#FF4FA0]" />
                <h3 className="text-base font-bold uppercase font-display text-white">
                  Deixar uma Avaliação
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-white/50 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase font-display">
                  Avaliação Enviada com Sucesso!
                </h4>
                <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
                  Obrigado! Sua avaliação foi enviada e está{' '}
                  <strong className="text-amber-400">aguardando aprovação</strong> pelo administrador para ser exibida no catálogo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono-custom">
                    {errorMessage}
                  </div>
                )}

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-custom text-white/70 uppercase font-bold block">
                    Seu Nome ou Apelido: *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria S. ou Cliente VIP"
                    className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-xl p-3 text-xs text-white outline-none transition-colors"
                  />
                </div>

                {/* Star Rating Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-custom text-white/70 uppercase font-bold block">
                    Sua Avaliação (1 a 5 Estrelas): *
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-all duration-300 ${
                            star <= (hoverRating || rating)
                              ? 'fill-[#FF4FA0] text-[#FF4FA0] drop-shadow-[0_0_10px_rgba(255,79,160,0.9)] scale-110'
                              : 'text-white/20 hover:text-white/40'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#FF4FA0] font-mono-custom ml-2 animate-pulse">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono-custom text-white/70 uppercase font-bold block">
                    Escreva seu comentário: *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte sua experiência com os produtos, embalagem ou velocidade de entrega..."
                    className="w-full bg-[#111113] border border-white/10 focus:border-[#EC0E78] rounded-xl p-3 text-xs text-white outline-none transition-colors"
                  />
                </div>

                {/* Disclaimer */}
                <div className="text-[11px] text-white/50 font-mono-custom bg-[#111113] p-3 rounded-xl border border-white/5 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF4FA0] shrink-0 mt-0.5" />
                  <span>
                    Sua avaliação passará por moderação da equipe antes de ser publicada publicamente.
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_14px_rgba(236,14,120,0.4)] hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Enviando...' : 'Enviar Avaliação'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
