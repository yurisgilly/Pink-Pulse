'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types/erp.types';
import logoImg from '@/assets/sem coraçao.png';
import { 
  exportCatalogAsPNG, 
  exportCatalogAsJPG, 
  exportCatalogAsPDF 
} from '@/lib/catalog-canvas';
import { 
  X, Printer, Download, ChevronLeft, ChevronRight, BookOpen, Sparkles, Loader2, FileText, Image as ImageIcon 
} from 'lucide-react';

interface CatalogOverviewProps {
  products: Product[];
  categories: Category[];
  onClose: () => void;
  initialFormat?: 'pdf' | 'jpg' | 'png';
}

export const CatalogOverview: React.FC<CatalogOverviewProps> = ({
  products,
  categories,
  onClose,
  initialFormat,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8; // 8 compact products per catalog page spread
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE) || 1;

  const getCategoryName = (id?: string) => {
    if (!id) return 'Acessórios';
    return categories.find(c => c.id === id)?.name || 'Geral';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = React.useCallback(async () => {
    setIsExporting(true);
    setExportingFormat('pdf');
    try {
      await exportCatalogAsPDF(products, categories);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  }, [products, categories]);

  const handleExportImage = React.useCallback(async (format: 'jpg' | 'png' = 'jpg') => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      if (format === 'png') {
        await exportCatalogAsPNG(products, categories, currentPage);
      } else {
        await exportCatalogAsJPG(products, categories, currentPage);
      }
    } catch (err) {
      console.error('Erro ao exportar imagem:', err);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  }, [products, categories, currentPage]);

  // Auto trigger export format if passed from modal
  useEffect(() => {
    if (initialFormat === 'jpg' || initialFormat === 'png') {
      const timer = setTimeout(() => {
        handleExportImage(initialFormat);
      }, 400);
      return () => clearTimeout(timer);
    } else if (initialFormat === 'pdf') {
      const timer = setTimeout(() => {
        handleExportPDF();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [initialFormat, handleExportImage, handleExportPDF]);

  const currentProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-y-auto flex flex-col animate-fade-in text-[#f2efeb]">
      
      {/* Global Print Styling for Pristine PDF Output */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #catalog-printable-page, #catalog-printable-page * {
            visibility: visible !important;
          }
          #catalog-printable-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
            box-shadow: none !important;
            border: none !important;
            background: #18181A !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-radius: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden sticky top-0 z-30 bg-[#18181A] border-b border-white/10 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-[#8B0D4E] to-[#A40D58] text-white rounded-[14px] shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display uppercase tracking-tight text-white flex items-center gap-2">
              <span>VISÃO GERAL DO CATÁLOGO</span>
              <span className="px-2.5 py-0.5 bg-[#EC0E78]/20 border border-[#EC0E78]/40 text-[#FF4FA0] text-[10px] font-mono-custom rounded-full">
                {products.length} PRODUTOS
              </span>
            </h2>
            <p className="text-xs text-white/60 font-mono-custom uppercase tracking-wider">
              Catálogo Profissional • Página {currentPage + 1} de {totalPages}
            </p>
          </div>
        </div>

        {/* Top Export Buttons: Exportar PDF, Exportar JPG, Exportar PNG, Imprimir */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting && exportingFormat === 'pdf' ? (
              <Loader2 className="w-4 h-4 text-[#FF4FA0] animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-[#FF4FA0]" />
            )}
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => handleExportImage('jpg')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting && exportingFormat === 'jpg' ? (
              <Loader2 className="w-4 h-4 text-[#FF4FA0] animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#FF4FA0]" />
            )}
            <span>Exportar JPG</span>
          </button>

          <button
            onClick={() => handleExportImage('png')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting && exportingFormat === 'png' ? (
              <Loader2 className="w-4 h-4 text-[#FF4FA0] animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 text-[#FF4FA0]" />
            )}
            <span>Exportar PNG</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white font-mono-custom text-xs font-bold uppercase tracking-wider rounded-[14px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-rose-600/30 text-white rounded-[14px] transition-all cursor-pointer border border-white/10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Catalog Viewport */}
      <div className="flex-1 p-4 sm:p-10 max-w-6xl mx-auto w-full">
        <div 
          id="catalog-printable-page"
          className="bg-gradient-to-b from-[#18181A] via-[#1E0E1B] to-[#121215] border border-white/15 rounded-[24px] p-6 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] space-y-8 text-white"
        >
          {/* Header Showcase Banner with Official Logo Image */}
          <div className="relative flex flex-col sm:flex-row items-center justify-between border-b border-white/15 pb-6 pt-2 gap-4">
            {/* Centered Large Logo with transparent background */}
            <div className="flex-1 flex justify-center items-center w-full">
              <img 
                src={logoImg.src} 
                alt="Pink Pulse Logo" 
                className="h-24 sm:h-32 md:h-36 object-contain drop-shadow-[0_6px_20px_rgba(236,14,120,0.65)]" 
              />
            </div>

            {/* Right Side ERP info & page number */}
            <div className="sm:absolute sm:right-0 sm:top-2 text-center sm:text-right font-mono-custom text-xs text-white/60 uppercase tracking-widest space-y-1">
              <div className="text-[#FF4FA0] font-extrabold">ERP PREMIUM</div>
              <div>Página {currentPage + 1} de {totalPages}</div>
            </div>
          </div>

          {/* Grid of Compact Showcase Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {currentProducts.map(p => {
              const formattedPrice = `R$ ${Number(p.sell_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              const categoryName = getCategoryName(p.category_id);
              const summaryDesc = p.description 
                ? (p.description.length > 70 ? p.description.slice(0, 70) + '...' : p.description)
                : 'Produto de altíssima qualidade e acabamento premium.';

              return (
                <div 
                  key={p.id}
                  className="bg-[#18181A] border border-white/10 rounded-[22px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-3 text-left"
                >
                  {/* Foto */}
                  <div className="aspect-square rounded-[16px] overflow-hidden bg-[#111113] border border-white/10 flex items-center justify-center relative">
                    {p.image_url ? (
                      <img 
                        src={p.image_url} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-3 flex flex-col items-center justify-center gap-1">
                        <img 
                          src={logoImg.src} 
                          alt="Logo Placeholder" 
                          className="w-10 h-10 object-contain opacity-80" 
                        />
                        <span className="text-[#FF4FA0] font-bold text-[10px] uppercase font-mono-custom">Pink Pulse</span>
                      </div>
                    )}
                  </div>

                  {/* Nome, Preço, Descrição Resumida, Categoria */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-white tracking-tight leading-snug line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-base font-extrabold text-[#FF4FA0] font-display block mt-0.5">
                        {formattedPrice}
                      </span>
                      <p className="text-xs text-white/70 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {summaryDesc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 mt-2">
                      <span className="text-[10px] font-mono-custom text-white/50 uppercase font-bold tracking-wider block">
                        Categoria: {categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catalog Footer */}
          <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between text-xs text-white/50 font-mono-custom uppercase tracking-wider gap-4">
            <div className="flex items-center gap-2">
              <img src={logoImg.src} alt="Logo Footer" className="w-5 h-5 object-contain opacity-70" />
              <span>PINK PULSE  • CATÁLOGO OFICIAL DE VENDAS</span>
            </div>
            <span>PRODUTOS DISPONÍVEIS MEDIANTE CONSULTA</span>
          </div>
        </div>

        {/* Page Navigation Controls (Hidden during print) */}
        {totalPages > 1 && (
          <div className="print:hidden flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#18181A] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 text-white font-mono-custom text-xs font-bold uppercase rounded-[14px] shadow-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#FF4FA0]" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-mono-custom font-bold text-white px-4 py-2 bg-[#18181A] rounded-[12px] border border-white/15 shadow-sm">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#18181A] hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/15 text-white font-mono-custom text-xs font-bold uppercase rounded-[14px] shadow-sm transition-all cursor-pointer"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4 text-[#FF4FA0]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

