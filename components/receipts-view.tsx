'use client';

import React, { useState, useEffect } from 'react';
import { useERP } from '@/contexts/erp.context';
import { SalesRepository } from '@/repositories/sales.repository';
import { Sale, SaleItem } from '@/types/erp.types';
import { 
  FileText, Download, Search, CheckCircle2, Calendar, User, CreditCard, RefreshCw, Eye, ShoppingBag, Printer 
} from 'lucide-react';

export const downloadReceiptText = (data: {
  id: string;
  created_at: string;
  customerName: string;
  paymentMethod: string;
  discountAmount: number;
  totalAmount: number;
  operatorName?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>;
}) => {
  const dateStr = new Date(data.created_at).toLocaleString('pt-BR');
  const paymentFormatted = {
    pix: 'PIX (INSTANTÂNEO)',
    card: 'CARTÃO DE CRÉDITO/DÉBITO',
    money: 'DINHEIRO EM ESPÉCIE',
    debt: 'FIADO / CREDIÁRIO'
  }[data.paymentMethod] || data.paymentMethod.toUpperCase();

  const itemsFormatted = data.items.map(item => 
    `• ${item.name} (${item.quantity}x R$ ${item.unitPrice.toFixed(2)}) = R$ ${item.totalPrice.toFixed(2)}`
  ).join('\n');

  const content = `============================================================
                     PINK PULSE ERP
                COMPROVANTE DE COMPRA
============================================================
CÓDIGO DA VENDA: #${data.id}
DATA / HORA    : ${dateStr}
OPERADOR       : ${data.operatorName || 'Vendedor'}

------------------------------------------------------------
DADOS DO CLIENTE:
NOME: ${data.customerName}

FORMA DE PAGAMENTO:
${paymentFormatted}

------------------------------------------------------------
ITENS COMPRADOS:
${itemsFormatted}

------------------------------------------------------------
DESCONTO APLICADO : R$ ${data.discountAmount.toFixed(2)}
VALOR TOTAL PAGO  : R$ ${data.totalAmount.toFixed(2)}
============================================================
          Obrigado por comprar na Pink Pulse!
                www.pinkpulse.com.br
============================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comprovante_pink_pulse_${data.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ReceiptsView: React.FC = () => {
  const { sales, customers, currentUser, refreshAll, loading } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const filteredSales = sales.filter(s => {
    const term = searchTerm.toLowerCase();
    const custName = s.customer_name || 'Consumidor Final';
    return (
      s.id.toLowerCase().includes(term) ||
      custName.toLowerCase().includes(term) ||
      s.payment_method.toLowerCase().includes(term)
    );
  });

  const handleOpenReceiptModal = async (sale: Sale) => {
    setSelectedSale(sale);
    setLoadingItems(true);
    try {
      const items = await SalesRepository.getSaleItems(sale.id);
      setSaleItems(items);
    } catch (err) {
      console.error('Erro ao buscar itens da venda:', err);
      setSaleItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDownloadSingleReceipt = (sale: Sale, items: SaleItem[]) => {
    downloadReceiptText({
      id: sale.id,
      created_at: sale.created_at,
      customerName: sale.customer_name || 'Consumidor Final',
      paymentMethod: sale.payment_method,
      discountAmount: sale.discount_amount || 0,
      totalAmount: sale.total_amount,
      operatorName: currentUser?.name || 'Operador',
      items: items.map(i => ({
        name: i.product_name || 'Produto',
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price
      }))
    });
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'pix':
        return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-mono-custom text-[10px] font-bold uppercase">PIX</span>;
      case 'card':
        return <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-mono-custom text-[10px] font-bold uppercase">CARTÃO</span>;
      case 'money':
        return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-mono-custom text-[10px] font-bold uppercase">DINHEIRO</span>;
      case 'debt':
        return <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-mono-custom text-[10px] font-bold uppercase">FIADO</span>;
      default:
        return <span className="px-2.5 py-1 bg-white/10 text-white border border-white/20 rounded-full font-mono-custom text-[10px] font-bold uppercase">{method}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#f2efeb]" id="receipts-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181A] p-6 rounded-[22px] border border-[#ECEEF5]/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)]" id="receipts-header">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#EC0E78]/10 rounded-[16px] border border-[#EC0E78]/20 text-[#EC0E78]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-white">Comprovantes de Venda</h2>
            <p className="text-xs text-[#64748B] font-mono-custom uppercase tracking-wider mt-1">Armazenamento seguro de recibos, comprovantes e histórico de compras.</p>
          </div>
        </div>

        <button
          id="btn-sync-receipts"
          onClick={refreshAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[16px] transition-all text-xs font-mono-custom font-bold uppercase text-[#f2efeb] cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#EC0E78]' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#64748B]" />
        <input
          type="text"
          id="search-receipts"
          placeholder="BUSCAR COMPROVANTE POR CÓDIGO, CLIENTE OU FORMA DE PAGAMENTO..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#18181A] border border-[#ECEEF5]/10 focus:border-[#EC0E78] text-xs text-white outline-none transition-all placeholder-[#64748B] font-mono-custom uppercase tracking-wider rounded-[16px]"
        />
      </div>

      {/* Sales Receipts Table / Cards */}
      <div className="bg-[#18181A] rounded-[22px] border border-[#ECEEF5]/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden" id="receipts-list-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-custom" id="receipts-table">
            <thead className="bg-black/30 border-b border-[#ECEEF5]/10 text-[#64748B] uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Código / Data</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Pagamento</th>
                <th className="py-4 px-6">Valor Total</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEEF5]/5">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-xs">#{sale.id.slice(0, 8)}...</div>
                    <div className="text-[10px] text-[#64748B] flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sale.created_at).toLocaleString('pt-BR')}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#EC0E78]" />
                      <span className="font-bold text-white">{sale.customer_name || 'Consumidor Final'}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {getPaymentBadge(sale.payment_method)}
                  </td>

                  <td className="py-4 px-6 font-bold text-[#EC0E78] text-sm">
                    R$ {sale.total_amount.toFixed(2)}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`btn-view-receipt-${sale.id}`}
                        onClick={() => handleOpenReceiptModal(sale)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-[12px] transition-all text-[11px] font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#EC0E78]" />
                        <span>Ver</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64748B] font-mono-custom uppercase tracking-wider">
                    Nenhum comprovante de venda encontrado no sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="receipt-detail-modal">
          <div className="bg-[#18181A] rounded-[24px] max-w-lg w-full border border-[#ECEEF5]/20 p-6 shadow-2xl animate-scale-up space-y-6 text-[#f2efeb]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#EC0E78]/10 rounded-[14px] text-[#EC0E78] border border-[#EC0E78]/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display uppercase tracking-tight text-white">Comprovante de Compra</h3>
                  <p className="text-[10px] text-[#64748B] font-mono-custom uppercase">Código: #{selectedSale.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-[#64748B] hover:text-white text-xs font-bold font-mono-custom cursor-pointer"
              >
                ✕ FECHAR
              </button>
            </div>

            {/* Receipt Content Card */}
            <div className="p-5 bg-black/50 border border-white/10 rounded-[18px] text-xs font-mono-custom space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Data e Hora:</span>
                <span className="font-bold text-white">{new Date(selectedSale.created_at).toLocaleString('pt-BR')}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Cliente:</span>
                <span className="font-bold text-white">{selectedSale.customer_name || 'Consumidor Final'}</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Método de Pagamento:</span>
                <div>{getPaymentBadge(selectedSale.payment_method)}</div>
              </div>

              {/* Items List */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#EC0E78] uppercase tracking-wider block mb-2">Itens do Pedido:</span>
                {loadingItems ? (
                  <div className="py-4 text-center text-[#64748B]">Carregando produtos do comprovante...</div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {saleItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-1 border-b border-white/5 text-[11px]">
                        <span className="text-white">{item.product_name || 'Produto'} <strong className="text-[#EC0E78]">({item.quantity}x)</strong></span>
                        <span className="font-bold text-white">R$ {item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                    {saleItems.length === 0 && (
                      <div className="text-center py-2 text-[#64748B]">Nenhum item discriminado.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-white/20 pt-3 space-y-1.5">
                {selectedSale.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto Concedido:</span>
                    <span>- R$ {selectedSale.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-white pt-1">
                  <span>Valor Total Pago:</span>
                  <span className="text-[#EC0E78]">R$ {selectedSale.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                id="btn-download-receipt-modal"
                onClick={() => handleDownloadSingleReceipt(selectedSale, saleItems)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.02] text-white font-mono-custom text-xs font-bold uppercase tracking-wider transition-all rounded-[16px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Comprovante (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsView;
