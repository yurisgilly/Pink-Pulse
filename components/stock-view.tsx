'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { useERP } from '@/contexts/erp.context';
import { ProductsRepository } from '@/repositories/products.repository';
import { ERPRepository } from '@/repositories/erp.repository';
import { uploadImageToStorage, validateImageFile } from '@/lib/storage';
import { 
  Package, Plus, Search, Layers, AlertCircle, ArrowUpRight, ArrowDownLeft, RotateCcw, Image as ImageIcon, Camera, ShoppingBag, Upload, Loader2, Trash2 
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, categories, suppliers, deleteProduct, updateProductFull, refreshAll } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'new-product' | 'new-category'>('products');

  // Form states (Cadastro)
  const [prodName, setProdName] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSupplier, setProdSupplier] = useState('');
  const [prodBuyPrice, setProdBuyPrice] = useState(0);
  const [prodSellPrice, setProdSellPrice] = useState(0);
  const [prodStock, setProdStock] = useState(10);
  const [prodMinStock, setProdMinStock] = useState(5);
  const [prodExpiry, setProdExpiry] = useState('');
  const [prodImage, setProdImage] = useState('');

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Full Stock Adjustment & Product Edit State
  const [adjustProductId, setAdjustProductId] = useState<string | null>(null);
  const [adjustName, setAdjustName] = useState('');
  const [adjustBarcode, setAdjustBarcode] = useState('');
  const [adjustBrand, setAdjustBrand] = useState('');
  const [adjustCategory, setAdjustCategory] = useState('');
  const [adjustSupplier, setAdjustSupplier] = useState('');
  const [adjustBuyPrice, setAdjustBuyPrice] = useState<number>(0);
  const [adjustSellPrice, setAdjustSellPrice] = useState<number>(0);
  const [adjustStock, setAdjustStock] = useState<number>(0);
  const [adjustMinStock, setAdjustMinStock] = useState<number>(5);
  const [adjustExpiry, setAdjustExpiry] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [adjustReason, setAdjustReason] = useState('adjustment');
  const [adjustSelectedFile, setAdjustSelectedFile] = useState<File | null>(null);
  const [adjustPreviewUrl, setAdjustPreviewUrl] = useState<string>('');
  const [adjustFileError, setAdjustFileError] = useState<string | null>(null);
  const [adjustIsUploading, setAdjustIsUploading] = useState<boolean>(false);

  const handleOpenAdjustModal = (product: any) => {
    setAdjustProductId(product.id);
    setAdjustName(product.name || '');
    setAdjustBarcode(product.barcode || '');
    setAdjustBrand(product.brand || '');
    setAdjustCategory(product.category_id || '');
    setAdjustSupplier(product.supplier_id || '');
    setAdjustBuyPrice(product.buy_price || 0);
    setAdjustSellPrice(product.sell_price || 0);
    setAdjustStock(product.stock || 0);
    setAdjustMinStock(product.min_stock || 0);
    setAdjustExpiry(product.expiry_date || '');
    setAdjustDescription(product.description || '');
    setAdjustReason('adjustment');
    setAdjustSelectedFile(null);
    setAdjustPreviewUrl(product.image_url || '');
    setAdjustFileError(null);
  };

  const handleAdjustFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAdjustFileError(null);
    if (!file) return;

    const err = validateImageFile(file);
    if (err) {
      setAdjustFileError(err);
      setAdjustSelectedFile(null);
      return;
    }

    setAdjustSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setAdjustPreviewUrl(localPreview);
  };

  const handleStockAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId) return;

    if (!adjustName || !adjustCategory || !adjustSupplier || Number(adjustSellPrice) <= 0) {
      alert('Por favor preencha os campos obrigatórios (Nome, Categoria, Fornecedor e Preço de Venda).');
      return;
    }

    setAdjustIsUploading(true);
    setAdjustFileError(null);

    try {
      let finalImageUrl = adjustPreviewUrl;
      if (adjustSelectedFile) {
        finalImageUrl = await uploadImageToStorage('product-images', adjustSelectedFile, adjustPreviewUrl);
      }

      const success = await updateProductFull(
        adjustProductId,
        {
          name: adjustName,
          barcode: adjustBarcode || undefined,
          brand: adjustBrand || undefined,
          category_id: adjustCategory,
          supplier_id: adjustSupplier,
          buy_price: Number(adjustBuyPrice),
          sell_price: Number(adjustSellPrice),
          stock: Number(adjustStock),
          min_stock: Number(adjustMinStock),
          expiry_date: adjustExpiry || undefined,
          image_url: finalImageUrl,
          description: adjustDescription
        },
        adjustReason
      );

      if (success) {
        alert(`Produto "${adjustName}" e estoque atualizados com sucesso!`);
        setAdjustProductId(null);
        refreshAll();
      } else {
        alert('Ocorreu um erro ao atualizar o produto.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar alterações do produto.');
    } finally {
      setAdjustIsUploading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCategory || !prodSupplier || prodSellPrice <= 0) {
      alert('Por favor preencha os campos obrigatórios.');
      return;
    }
    const result = await ProductsRepository.createProduct({
      name: prodName,
      barcode: prodBarcode || undefined,
      brand: prodBrand || undefined,
      category_id: prodCategory,
      supplier_id: prodSupplier,
      buy_price: Number(prodBuyPrice),
      sell_price: Number(prodSellPrice),
      stock: Number(prodStock),
      min_stock: Number(prodMinStock),
      expiry_date: prodExpiry || undefined,
      image_url: prodImage || `https://picsum.photos/seed/${prodName}/400/400`
    });
    
    if (result) {
      alert(`Produto ${result.name} cadastrado com SKU automático: ${result.sku}`);
      setProdName('');
      setProdBarcode('');
      setProdBrand('');
      setProdCategory('');
      setProdSupplier('');
      setProdBuyPrice(0);
      setProdSellPrice(0);
      setProdStock(10);
      setProdMinStock(5);
      setProdExpiry('');
      setProdImage('');
      setActiveSubTab('products');
      refreshAll();
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    const result = await ERPRepository.createCategory(catName, catDesc || undefined);
    if (result) {
      alert(`Categoria "${result.name}" criada com sucesso!`);
      setCatName('');
      setCatDesc('');
      setActiveSubTab('products');
      refreshAll();
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o produto "${name}" do catálogo?`)) {
      try {
        const ok = await deleteProduct(id);
        if (ok) {
          if (adjustProductId === id) setAdjustProductId(null);
          alert('O produto foi desativado com sucesso. O histórico de vendas foi preservado.');
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao remover produto.');
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#f2efeb]" id="stock-screen">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" id="stock-header">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight uppercase text-[#E6007E]">Estoque & Almoxarifado</h2>
          <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Gestão de catálogo, SKUs, controle mínimo de segurança e fluxos.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            id="subtab-products-list"
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-3 border text-[11px] font-bold font-mono-custom uppercase tracking-widest transition-all cursor-pointer rounded-[4px] ${
              activeSubTab === 'products'
                ? 'bg-[#E6007E] border-[#E6007E] text-[#111113]'
                : 'bg-[rgba(242,239,235,0.05)] text-[#f2efeb]/60 border-[rgba(242,239,235,0.1)] hover:bg-[rgba(242,239,235,0.1)] hover:text-[#f2efeb]'
            }`}
          >
            Todos os Produtos
          </button>
          <button
            id="subtab-new-product"
            onClick={() => setActiveSubTab('new-product')}
            className={`px-4 py-3 border text-[11px] font-bold font-mono-custom uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 rounded-[4px] ${
              activeSubTab === 'new-product'
                ? 'bg-[#E6007E] border-[#E6007E] text-[#111113]'
                : 'bg-[rgba(242,239,235,0.05)] text-[#f2efeb]/60 border-[rgba(242,239,235,0.1)] hover:bg-[rgba(242,239,235,0.1)] hover:text-[#f2efeb]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Produto
          </button>
          <button
            id="subtab-new-category"
            onClick={() => setActiveSubTab('new-category')}
            className={`px-4 py-3 border text-[11px] font-bold font-mono-custom uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 rounded-[4px] ${
              activeSubTab === 'new-category'
                ? 'bg-[#E6007E] border-[#E6007E] text-[#111113]'
                : 'bg-[rgba(242,239,235,0.05)] text-[#f2efeb]/60 border-[rgba(242,239,235,0.1)] hover:bg-[rgba(242,239,235,0.1)] hover:text-[#f2efeb]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* RENDER LIST VIEW */}
      {activeSubTab === 'products' && (
        <div className="space-y-6" id="products-list-container">
          {/* Quick Filters */}
          <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#f2efeb]/40" />
              <input
                type="text"
                id="search-products"
                placeholder="BUSCAR POR NOME, SKU, CÓDIGO DE BARRAS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.05)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none transition-all placeholder-[#f2efeb]/30 font-mono-custom uppercase tracking-wider rounded-[4px]"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto text-[11px] text-[#f2efeb]/60 font-mono-custom uppercase tracking-wider">
              <span>Filtros:</span>
              <strong className="text-[#E6007E]">{filteredProducts.length} itens encontrados</strong>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse" id="table-all-products">
              <thead>
                <tr className="border-b border-[rgba(242,239,235,0.1)] text-[10px] font-bold uppercase tracking-widest text-[#f2efeb]/40 font-mono-custom">
                  <th className="py-3">Produto</th>
                  <th className="py-3">SKU / Marca</th>
                  <th className="py-3">Preços (Custo/Venda)</th>
                  <th className="py-3">Margem / Lucro</th>
                  <th className="py-3 text-center">Qtd. Estoque</th>
                  <th className="py-3 text-center">Mínimo</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(242,239,235,0.05)] text-xs">
                {filteredProducts.map((p) => {
                  const profit = p.sell_price - p.buy_price;
                  const isLow = p.stock <= p.min_stock;
                  const category = categories.find(c => c.id === p.category_id)?.name || 'Outros';

                  return (
                    <tr key={p.id} className="hover:bg-[rgba(242,239,235,0.02)] transition-all group text-[#f2efeb]/80">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[4px] bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] flex items-center justify-center overflow-hidden relative">
                            {p.image_url ? (
                              <NextImage 
                                src={p.image_url} 
                                alt={p.name} 
                                width={40}
                                height={40}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Package className="w-5 h-5 text-[#E6007E]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#f2efeb] block text-xs leading-normal">{p.name}</span>
                            <span className="text-[9px] text-[#f2efeb]/60 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] px-2.5 py-0.5 mt-1 inline-block uppercase font-mono-custom tracking-wider rounded-none">{category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-mono-custom font-bold text-[#E6007E] block">{p.sku}</span>
                        <span className="text-[#f2efeb]/40 text-[10px] font-mono-custom uppercase tracking-wider block mt-0.5">{p.brand || 'Pink Pulse'}</span>
                      </td>
                      <td className="py-4">
                        <div className="space-y-0.5 font-mono-custom text-[11px] uppercase tracking-wide">
                          <span className="block text-[#f2efeb]/40">Custo: R$ {p.buy_price.toFixed(2)}</span>
                          <span className="block font-bold text-[#f2efeb]">Venda: R$ {p.sell_price.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono-custom text-[11px]">
                        <span className="text-emerald-500 font-bold block">R$ {profit.toFixed(2)}</span>
                        <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider">+{p.profit_margin || (((p.sell_price - p.buy_price) / p.buy_price) * 100).toFixed(0)}% Lucro</span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`px-2.5 py-1 font-bold font-mono-custom text-[10px] uppercase tracking-wider ${
                            isLow 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {p.stock} un
                          </span>
                          {isLow && <AlertCircle className="w-3.5 h-3.5 text-[#E6007E]" />}
                        </div>
                      </td>
                      <td className="py-4 text-center text-[#f2efeb]/40 font-mono-custom text-[11px]">{p.min_stock} UN</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-edit-photo-${p.id}`}
                            onClick={() => handleOpenAdjustModal(p)}
                            className="px-2.5 py-1.5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-bold text-[10px] font-mono-custom uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 rounded-[4px]"
                            title="Alterar Foto do Produto"
                          >
                            <Camera className="w-3 h-3 text-[#EC0E78]" />
                            <span>Alterar Foto</span>
                          </button>
                          <button
                            id={`btn-adjust-stock-${p.id}`}
                            onClick={() => handleOpenAdjustModal(p)}
                            className="px-3 py-1.5 border border-[#EC0E78]/30 text-[#EC0E78] hover:bg-[#EC0E78]/10 font-bold text-[10px] font-mono-custom uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1 rounded-[4px]"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Ajustar / Editar</span>
                          </button>
                          <button
                            id={`btn-delete-product-${p.id}`}
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="px-2.5 py-1.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-[10px] font-mono-custom uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-1 rounded-[4px]"
                            title="Remover Produto do Estoque"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remover</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#f2efeb]/40 font-mono-custom">Nenhum produto cadastrado com os critérios buscados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT VIEW */}
      {activeSubTab === 'new-product' && (
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-8 max-w-3xl" id="new-product-container">
          <div className="mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#E6007E]" />
            <h2 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Novo Cadastro de Produto Premium</h2>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Nome do Produto *</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={e => setProdName(e.target.value)} 
                  placeholder="Ex: Rose Gold Elixir Perfume" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Código de Barras (Opcional)</label>
                <input 
                  type="text" 
                  value={prodBarcode} 
                  onChange={e => setProdBarcode(e.target.value)} 
                  placeholder="EAN-13" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Categoria *</label>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
                  required
                >
                  <option value="">Selecione a Categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Fornecedor Principal *</label>
                <select
                  value={prodSupplier}
                  onChange={e => setProdSupplier(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
                  required
                >
                  <option value="">Selecione o Fornecedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} - CNPJ</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Preço de Custo (Compra) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={prodBuyPrice} 
                  onChange={e => setProdBuyPrice(Number(e.target.value))} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Preço de Venda Praticado *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={prodSellPrice} 
                  onChange={e => setProdSellPrice(Number(e.target.value))} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Estoque Inicial Cadastrado *</label>
                <input 
                  type="number" 
                  value={prodStock} 
                  onChange={e => setProdStock(Number(e.target.value))} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Estoque Mínimo de Segurança *</label>
                <input 
                  type="number" 
                  value={prodMinStock} 
                  onChange={e => setProdMinStock(Number(e.target.value))} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Data de Validade (Opcional)</label>
                <input 
                  type="date" 
                  value={prodExpiry} 
                  onChange={e => setProdExpiry(e.target.value)} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Marca / Brand</label>
                <input 
                  type="text" 
                  value={prodBrand} 
                  onChange={e => setProdBrand(e.target.value)} 
                  placeholder="Ex: Pink Pulse Cosmetics" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                id="btn-cancel-create-prod"
                onClick={() => setActiveSubTab('products')}
                className="px-5 py-3 border border-[rgba(242,239,235,0.1)] text-[#f2efeb]/80 text-[11px] font-bold font-mono-custom uppercase tracking-wider hover:bg-white/5 rounded-[4px]"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="btn-submit-create-prod"
                className="px-5 py-3 bg-[#E6007E] border border-[#E6007E] text-[#111113] hover:bg-transparent hover:text-[#E6007E] text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[4px]"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE NEW CATEGORY VIEW */}
      {activeSubTab === 'new-category' && (
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-8 max-w-xl" id="new-category-container">
          <div className="mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E6007E]" />
            <h2 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Nova Categoria de Catálogo</h2>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Nome da Categoria *</label>
              <input 
                type="text" 
                value={catName} 
                onChange={e => setCatName(e.target.value)} 
                placeholder="Ex: Perfumes de Nicho, Elixires Faciais..." 
                className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Descrição Curta (Opcional)</label>
              <textarea 
                value={catDesc} 
                onChange={e => setCatDesc(e.target.value)} 
                placeholder="Definição rápida da linha de produtos contidos." 
                className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-create-cat"
                onClick={() => setActiveSubTab('products')}
                className="px-5 py-3 border border-[rgba(242,239,235,0.1)] text-[#f2efeb]/80 text-[11px] font-bold font-mono-custom uppercase tracking-wider hover:bg-white/5 rounded-[4px]"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="btn-submit-create-cat"
                className="px-5 py-3 bg-[#E6007E] border border-[#E6007E] text-[#111113] hover:bg-transparent hover:text-[#E6007E] text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[4px]"
              >
                Salvar Categoria
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADJUST STOCK & EDIT PRODUCT OVERLAY MODAL */}
      {adjustProductId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="adjust-stock-overlay">
          <div className="bg-[#18181A] rounded-[8px] max-w-3xl w-full border border-[rgba(242,239,235,0.15)] p-6 md:p-8 shadow-2xl animate-scale-up text-[#f2efeb] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <h3 className="text-sm font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#E6007E]" />
                  Ajuste de Estoque & Editar Produto
                </h3>
                <p className="text-xs text-[#f2efeb]/60 font-mono-custom uppercase tracking-wider mt-1">
                  SKU: <span className="text-white font-bold">{products.find(p => p.id === adjustProductId)?.sku}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustProductId(null)}
                className="text-[#f2efeb]/50 hover:text-white p-1 rounded-md hover:bg-white/10 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Nome do Produto *</label>
                  <input 
                    type="text" 
                    value={adjustName} 
                    onChange={e => setAdjustName(e.target.value)} 
                    placeholder="Ex: Rose Gold Elixir Perfume" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Código de Barras (Opcional)</label>
                  <input 
                    type="text" 
                    value={adjustBarcode} 
                    onChange={e => setAdjustBarcode(e.target.value)} 
                    placeholder="EAN-13" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Categoria *</label>
                  <select
                    value={adjustCategory}
                    onChange={e => setAdjustCategory(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
                    required
                  >
                    <option value="">Selecione a Categoria</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Fornecedor Principal *</label>
                  <select
                    value={adjustSupplier}
                    onChange={e => setAdjustSupplier(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
                    required
                  >
                    <option value="">Selecione o Fornecedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Preço de Custo (Compra) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={adjustBuyPrice} 
                    onChange={e => setAdjustBuyPrice(Number(e.target.value))} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Preço de Venda Praticado *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={adjustSellPrice} 
                    onChange={e => setAdjustSellPrice(Number(e.target.value))} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Quantidade em Estoque (Total) *</label>
                  <input 
                    type="number" 
                    value={adjustStock} 
                    onChange={e => setAdjustStock(Number(e.target.value))} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs font-bold text-[#f2efeb] outline-none rounded-[4px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Estoque Mínimo de Segurança *</label>
                  <input 
                    type="number" 
                    value={adjustMinStock} 
                    onChange={e => setAdjustMinStock(Number(e.target.value))} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Data de Validade (Opcional)</label>
                  <input 
                    type="date" 
                    value={adjustExpiry} 
                    onChange={e => setAdjustExpiry(e.target.value)} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Marca / Brand</label>
                  <input 
                    type="text" 
                    value={adjustBrand} 
                    onChange={e => setAdjustBrand(e.target.value)} 
                    placeholder="Ex: Pink Pulse Cosmetics" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Descrição do Produto (Opcional)</label>
                <textarea 
                  value={adjustDescription} 
                  onChange={e => setAdjustDescription(e.target.value)} 
                  placeholder="Descrição detalhada do produto..." 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] min-h-[75px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Razão / Motivação do Ajuste de Estoque</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px] [&>option]:bg-[#18181A]"
                >
                  <option value="adjustment">Ajuste / Correcão Geral de Balanço</option>
                  <option value="purchase">Compra de Fornecedor</option>
                  <option value="devolution">Devolução de Cliente</option>
                  <option value="loss">Perda / Roubo / Quebra</option>
                  <option value="expiry">Vencimento de Lote</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Foto / Imagem do Produto</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[rgba(242,239,235,0.02)] p-4 border border-[rgba(242,239,235,0.08)] rounded-[4px]">
                  {adjustPreviewUrl ? (
                    <div className="relative w-20 h-20 rounded-[4px] overflow-hidden border border-white/20 shrink-0 bg-black/40">
                      <NextImage 
                        src={adjustPreviewUrl} 
                        alt="Preview" 
                        fill 
                        className="object-cover" 
                        unoptimized
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-[4px] bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-white/30" />
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    <label 
                      htmlFor="adjust-photo-file-input"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-mono-custom text-white uppercase tracking-wider rounded-[4px] cursor-pointer w-full transition-all text-center"
                    >
                      <Upload className="w-4 h-4 text-[#E6007E]" />
                      <span>{adjustSelectedFile ? adjustSelectedFile.name : 'Escolher Nova Foto (JPEG/PNG/WEBP)'}</span>
                    </label>
                    <input 
                      id="adjust-photo-file-input"
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAdjustFileChange}
                      className="hidden"
                    />
                    <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom mt-1.5">
                      Formatos aceitos: JPG, PNG, WEBP. Máximo: 5MB.
                    </p>
                    {adjustFileError && (
                      <p className="text-[11px] text-rose-400 font-bold font-mono-custom mt-1">
                        {adjustFileError}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  id="btn-remove-product-modal"
                  onClick={() => {
                    const prod = products.find(p => p.id === adjustProductId);
                    if (prod) {
                      handleDeleteProduct(prod.id, prod.name);
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[4px] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Produto</span>
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    id="btn-cancel-adjust-stock"
                    onClick={() => setAdjustProductId(null)}
                    className="px-5 py-3 border border-[rgba(242,239,235,0.1)] text-[#f2efeb]/80 text-[11px] font-bold font-mono-custom uppercase tracking-wider hover:bg-white/5 rounded-[4px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-adjust-stock"
                    disabled={adjustIsUploading}
                    className="px-6 py-3 bg-[#E6007E] border border-[#E6007E] text-[#111113] hover:bg-transparent hover:text-[#E6007E] text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[4px] flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                  >
                    {adjustIsUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#111113]" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar Alterações do Produto</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default StockView;
