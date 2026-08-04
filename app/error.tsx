'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('App Router Boundary Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#1f2833] border border-[#ff007f]/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-[#ff007f]/10 text-[#ff007f] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          !
        </div>
        
        <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
          Algo deu errado
        </h1>
        
        <p className="text-sm text-[#c5c6c7]/80 mb-6 leading-relaxed">
          Ocorreu um erro inesperado ao carregar esta página. Nossa equipe já foi notificada.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#ff007f] hover:bg-[#e00070] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#ff007f]/20 cursor-pointer"
          >
            Tentar novamente
          </button>
          
          <Link
            href="/catalogo"
            className="w-full py-3 px-4 bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] border border-[#45a29e]/30 font-medium rounded-xl transition-all cursor-pointer text-sm"
          >
            Voltar ao Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
