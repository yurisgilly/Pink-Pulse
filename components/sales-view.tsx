'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useERP } from '@/contexts/erp.context';
import { downloadReceiptText } from '@/components/receipts-view';
import { 
  ShoppingBag, Trash2, Tag, CreditCard, DollarSign, UserCheck, CheckCircle2, Ticket, Sparkles, Download, FileText 
} from 'lucide-react';

export const SalesView: React.FC = () => {
  const { products, customers, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, executeCheckout, currentUser } = useERP();
  const [discountVal, setDiscountVal] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix' | 'debt'>('pix');
  const [productSearch, setProductSearch] = useState('');

  // Local success alert
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleDetails, setLastSaleDetails] = useState<any>(null);

  const availableProducts = products.filter(p => 
    p.stock > 0 && 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal = cart.reduce((acc, item) => acc + item.product.sell_price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountVal);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) {
      alert('Seu carrinho de vendas está vazio!');
      return;
    }
    if (paymentMethod === 'debt' && !selectedCustomer) {
      alert('Para vendas do tipo "FIADO / DEVEDOR", você deve selecionar um cliente cadastrado!');
      return;
    }

    const result = await executeCheckout(paymentMethod, Number(discountVal), selectedCustomer || undefined);
    if (result.success && result.sale) {
      setLastSaleDetails({
        id: result.sale.id,
        payment: paymentMethod,
        discount: discountVal,
        total: total,
        customerName: customers.find(c => c.id === selectedCustomer)?.name || 'Consumidor Final',
        items: [...cart]
      });
      setShowReceipt(true);
      setDiscountVal(0);
      setSelectedCustomer('');
      setPaymentMethod('pix');
    } else {
      alert(`Falha no checkout: ${result.error}`);
    }
  };  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-[#f2efeb]" id="sales-screen">
      {/* LEFT: Product catalog (7 Cols) */}
      <div className="lg:col-span-7 space-y-6" id="sales-pdv-catalog">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight uppercase text-[#E6007E]">Frente de Caixa</h2>
            <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Terminal de vendas diretas com baixa instantânea de estoque.</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          id="search-pdv-products"
          placeholder="BUSCAR PRODUTO PARA ADICIONAR AO CARRINHO..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="w-full px-5 py-4 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.05)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none transition-all placeholder-[#f2efeb]/30 font-mono-custom uppercase tracking-wider rounded-[4px]"
        />

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="pdv-products-grid">
          {availableProducts.map(p => {
            const inCart = cart.find(item => item.product.id === p.id);
            const qtyLeft = p.stock - (inCart?.quantity || 0);

            return (
              <div 
                key={p.id}
                className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-5 transition-all flex flex-col justify-between group"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-[4px] overflow-hidden border border-[rgba(242,239,235,0.1)] bg-[rgba(242,239,235,0.02)] relative">
                    <Image 
                      src={p.image_url || `https://picsum.photos/seed/${p.name}/400/400`} 
                      alt={p.name} 
                      width={64}
                      height={64}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-[#E6007E] font-mono-custom uppercase tracking-wider font-bold">SKU: {p.sku}</span>
                    <h4 className="text-xs font-bold text-[#f2efeb] truncate mt-0.5">{p.name}</h4>
                    <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase mt-0.5">{p.brand || 'Pink Pulse'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-[9px] text-[#f2efeb]/40 block uppercase font-mono-custom">Preço final</span>
                    <span className="text-sm font-bold text-[#E6007E] font-mono-custom">R$ {p.sell_price.toFixed(2)}</span>
                  </div>
                  <button
                    id={`btn-add-to-cart-${p.id}`}
                    onClick={() => addToCart(p)}
                    disabled={qtyLeft <= 0}
                    className={`px-3.5 py-2 text-[10px] font-mono-custom uppercase tracking-wider font-bold border transition-all cursor-pointer rounded-[4px] ${
                      qtyLeft <= 0
                        ? 'bg-[rgba(242,239,235,0.02)] text-[#f2efeb]/20 border-[rgba(242,239,235,0.05)] cursor-not-allowed'
                        : 'bg-[rgba(230,0,126,0.15)] text-[#E6007E] border-[#E6007E]/30 hover:bg-[#E6007E] hover:text-[#111113]'
                    }`}
                  >
                    {qtyLeft <= 0 ? 'Esgotado' : 'Adicionar'}
                  </button>
                </div>
                <div className="text-[10px] text-right mt-2 font-mono-custom uppercase tracking-wider text-[#f2efeb]/40">
                  Estoque: <strong className="text-[#f2efeb]/80">{p.stock} UN</strong>
                </div>
              </div>
            );
          })}
          {availableProducts.length === 0 && (
            <div className="col-span-2 py-12 text-center text-[#f2efeb]/40 font-mono-custom">Nenhum produto disponível em estoque no momento.</div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart Details / Receipt Preview (5 Cols) */}
      <div className="lg:col-span-5" id="sales-pdv-checkout">
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 space-y-6 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-[rgba(242,239,235,0.1)] pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E6007E]" />
                <h3 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Cupom do Carrinho</h3>
              </div>
              <button 
                id="btn-clear-cart"
                onClick={clearCart} 
                className="text-[10px] font-mono-custom uppercase tracking-wider text-[#f2efeb]/40 hover:text-[#E6007E] transition-all font-bold cursor-pointer"
              >
                Esvaziar
              </button>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-[rgba(242,239,235,0.05)] max-h-[180px] overflow-y-auto mt-2 pr-1 space-y-1.5 animate-fade-in" id="cart-items-list">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex-1 pr-3">
                    <span className="font-bold text-[#f2efeb] block leading-normal">{item.product.name}</span>
                    <span className="text-[10px] text-[#f2efeb]/40 font-mono-custom mt-0.5 block">R$ {item.product.sell_price.toFixed(2)} x {item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[rgba(242,239,235,0.1)] bg-black/20 rounded-[4px] overflow-hidden">
                      <button 
                        id={`btn-cart-minus-${item.product.id}`}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} 
                        className="px-2.5 py-1 text-[#f2efeb]/60 hover:bg-[#E6007E]/15 hover:text-[#E6007E] font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-bold font-mono-custom text-[#f2efeb] text-xs">{item.quantity}</span>
                      <button 
                        id={`btn-cart-plus-${item.product.id}`}
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} 
                        className="px-2.5 py-1 text-[#f2efeb]/60 hover:bg-[#E6007E]/15 hover:text-[#E6007E] font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      id={`btn-cart-remove-${item.product.id}`}
                      onClick={() => removeFromCart(item.product.id)} 
                      className="p-1.5 hover:bg-rose-500/10 text-[#f2efeb]/30 hover:text-rose-400 transition-colors cursor-pointer rounded-[4px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-8 text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider text-[11px]">Seu carrinho está vazio. Toque em &ldquo;Adicionar&rdquo; nos produtos.</div>
              )}
            </div>
          </div>

          {/* Form details (Discount, Customer, Method) */}
          <div className="space-y-4 border-t border-[rgba(242,239,235,0.1)] pt-4">
            {/* Customer select */}
            <div>
              <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Associar Cliente VIP</label>
              <select
                id="select-pdv-customer"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
              >
                <option value="">Consumidor Final (Não identificado)</option>
                {customers.map(c => <option key={c.id} value={c.id} className="bg-[#18181A]">{c.name} - {c.phone || 'Sem contato'}</option>)}
              </select>
            </div>

            {/* Discount box */}
            <div>
              <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Conceder Desconto (R$)</label>
              <div className="relative">
                <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-[#f2efeb]/40" />
                <input 
                  type="number" 
                  id="input-pdv-discount"
                  value={discountVal} 
                  onChange={e => setDiscountVal(Number(e.target.value))} 
                  className="w-full pl-9 pr-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Método de Liquidação</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="pdv-payment-grid">
                {['pix', 'card', 'money', 'debt'].map(method => (
                  <button
                    key={method}
                    id={`btn-pdv-method-${method}`}
                    type="button"
                    onClick={() => setPaymentMethod(method as any)}
                    className={`py-2.5 text-[10px] font-bold font-mono-custom uppercase tracking-wider transition-all border rounded-[4px] cursor-pointer ${
                      paymentMethod === method 
                        ? 'bg-[#E6007E] text-[#111113] border-[#E6007E]' 
                        : 'bg-[rgba(242,239,235,0.03)] text-[#f2efeb]/40 border-[rgba(242,239,235,0.1)] hover:bg-[rgba(242,239,235,0.08)] hover:text-[#f2efeb]'
                    }`}
                  >
                    {method === 'debt' ? 'Fiado' : method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-[rgba(242,239,235,0.1)] pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#f2efeb]/60 font-mono-custom uppercase tracking-wider">
              <span>Subtotal dos Itens:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {discountVal > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold font-mono-custom uppercase tracking-wider">
                <span>Desconto Aplicado:</span>
                <span>- R$ {discountVal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-bold text-[#f2efeb] border-t border-dashed border-[rgba(242,239,235,0.1)] pt-2.5 font-mono-custom uppercase tracking-wider">
              <span>Total a Pagar:</span>
              <span className="text-base text-[#E6007E]">R$ {total.toFixed(2)}</span>
            </div>

            {/* Check-out trigger */}
            <button
              id="btn-pdv-checkout"
              onClick={handleCheckoutSubmit}
              disabled={cart.length === 0}
              className="w-full py-4 bg-[#E6007E] hover:bg-[#ff4fa0] text-[#111113] hover:text-white font-mono-custom text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-[4px]"
            >
              Confirmar e Emitir Cupom (Venda)
            </button>
          </div>
        </div>
      </div>

      {/* RECEIPT / BILL CONFIRMATION POPUP */}
      {showReceipt && lastSaleDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="receipt-overlay">
          <div className="bg-[#18181A] rounded-[24px] max-w-md w-full border border-[#ECEEF5]/20 p-6 shadow-2xl animate-scale-up space-y-5 text-[#f2efeb]">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display uppercase tracking-tight text-white mt-3">Venda Confirmada!</h3>
              <p className="text-[10px] text-emerald-400 font-bold font-mono-custom uppercase tracking-widest bg-emerald-500/10 py-1 px-3 rounded-full inline-block">
                Comprovante Emitido &amp; Baixa em Estoque
              </p>
            </div>

            {/* Bill receipt data */}
            <div className="p-5 bg-black/50 border border-white/10 text-xs font-mono-custom uppercase tracking-wider space-y-3 text-white/80 rounded-[18px]">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Código da Venda:</span>
                <span className="font-bold text-[#EC0E78]">#{lastSaleDetails.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Nome do Cliente:</span>
                <span className="font-bold text-white">{lastSaleDetails.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-[#64748B]">Método Pagamento:</span>
                <span className="font-bold text-[#EC0E78]">{
                  {
                    pix: 'PIX (INSTANTÂNEO)',
                    card: 'CARTÃO',
                    money: 'DINHEIRO',
                    debt: 'FIADO / CREDIÁRIO'
                  }[lastSaleDetails.payment as string] || lastSaleDetails.payment
                }</span>
              </div>

              {/* Items sold */}
              <div className="pt-1">
                <span className="text-[10px] font-bold text-[#EC0E78] block mb-1.5">O QUE ESTÁ SENDO VENDIDO:</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {lastSaleDetails.items.map((item: any) => (
                    <div key={item.product.id} className="flex justify-between text-[11px] py-1 border-b border-white/5">
                      <span className="text-white">{item.product.name} <strong className="text-[#EC0E78]">({item.quantity}x)</strong></span>
                      <span className="font-bold text-white">R$ {(item.product.sell_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-white/20 pt-2.5 flex justify-between font-bold text-xs text-white">
                <span>Total da Compra:</span>
                <span className="text-base text-[#EC0E78]">R$ {lastSaleDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                id="btn-download-sale-receipt"
                onClick={() => downloadReceiptText({
                  id: lastSaleDetails.id,
                  created_at: new Date().toISOString(),
                  customerName: lastSaleDetails.customerName,
                  paymentMethod: lastSaleDetails.payment,
                  discountAmount: lastSaleDetails.discount || 0,
                  totalAmount: lastSaleDetails.total,
                  operatorName: currentUser?.name || 'Vendedor',
                  items: lastSaleDetails.items.map((i: any) => ({
                    name: i.product.name,
                    quantity: i.quantity,
                    unitPrice: i.product.sell_price,
                    totalPrice: i.product.sell_price * i.quantity
                  }))
                })}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.02] text-white font-mono-custom text-xs font-bold uppercase tracking-wider transition-all rounded-[16px] shadow-[0_4px_16px_rgba(236,14,120,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Comprovante de Compra (.txt)</span>
              </button>

              <button
                id="btn-close-receipt"
                onClick={() => setShowReceipt(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all cursor-pointer rounded-[16px]"
              >
                Nova Venda (PDV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SalesView;
