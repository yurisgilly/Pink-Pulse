'use client';

import React, { useState } from 'react';
import { useERP } from '@/contexts/erp.context';
import { 
  Truck, Plus, Search, Phone, Mail, MapPin, ShieldCheck, Briefcase, Trash2 
} from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, products, createSupplier, deleteSupplier } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [supName, setSupName] = useState('');
  const [supCnpj, setSupCnpj] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cnpj.includes(searchTerm)
  );

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supCnpj) {
      alert('Por favor, preencha o Nome e o CNPJ do fornecedor.');
      return;
    }
    setLoading(true);
    try {
      const result = await createSupplier({
        name: supName,
        cnpj: supCnpj,
        phone: supPhone || undefined,
        email: supEmail || undefined,
        address: supAddress || undefined
      });
      if (result) {
        alert(`Fornecedor "${result.name}" cadastrado com sucesso!`);
        setSupName('');
        setSupCnpj('');
        setSupPhone('');
        setSupEmail('');
        setSupAddress('');
        setIsAdding(false);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar fornecedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o fornecedor "${name}"?`)) {
      setLoading(true);
      try {
        const ok = await deleteSupplier(id);
        if (ok) {
          alert(`Fornecedor "${name}" removido com sucesso.`);
        }
      } catch (err: any) {
        alert(err.message || 'Erro ao remover fornecedor.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#f2efeb]" id="suppliers-screen">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" id="suppliers-header">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight uppercase text-[#EC0E78]">Fornecedores</h2>
          <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Cadastro e gestão de parceiros e fornecedores homologados.</p>
        </div>

        <button
          id="btn-toggle-add-supplier"
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-3 border text-[11px] font-bold font-mono-custom uppercase tracking-widest transition-all bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] border-none text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_rgba(236,14,120,0.3)] rounded-[16px] flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Ver Fornecedores' : 'Cadastrar Fornecedor'}
        </button>
      </div>

      {isAdding ? (
        /* CREATE FORM */
        <div className="bg-[#161618] rounded-[22px] border border-[rgba(242,239,235,0.1)] p-8 max-w-2xl" id="new-supplier-container">
          <div className="mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#EC0E78]" />
            <h3 className="text-xs font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider">Novo Cadastro de Fornecedor</h3>
          </div>

          <form onSubmit={handleCreateSupplier} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">Razão Social / Nome Fantasia *</label>
                <input 
                  type="text" 
                  value={supName} 
                  onChange={e => setSupName(e.target.value)} 
                  placeholder="Ex: LVMH Pulse Cosmetics" 
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none rounded-[16px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">CNPJ *</label>
                <input 
                  type="text" 
                  value={supCnpj} 
                  onChange={e => setSupCnpj(e.target.value)} 
                  placeholder="00.000.000/0001-00" 
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none rounded-[16px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">Telefone de Contato</label>
                <input 
                  type="text" 
                  value={supPhone} 
                  onChange={e => setSupPhone(e.target.value)} 
                  placeholder="(11) 98765-4321" 
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none rounded-[16px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">E-mail corporativo</label>
                <input 
                  type="email" 
                  value={supEmail} 
                  onChange={e => setSupEmail(e.target.value)} 
                  placeholder="comercial@fornecedor.com" 
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none rounded-[16px]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">Endereço Comercial</label>
                <input 
                  type="text" 
                  value={supAddress} 
                  onChange={e => setSupAddress(e.target.value)} 
                  placeholder="Av. Paulista, 1000 - São Paulo, SP" 
                  className="w-full px-4 py-3.5 bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none rounded-[16px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                id="btn-cancel-create-supplier"
                onClick={() => setIsAdding(false)}
                className="px-5 py-3 border border-[rgba(242,239,235,0.1)] text-[#f2efeb]/80 text-[11px] font-bold font-mono-custom uppercase tracking-wider hover:bg-[rgba(242,239,235,0.05)] rounded-[16px] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="btn-submit-create-supplier"
                disabled={loading}
                className="px-5 py-3 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] border-none text-white hover:scale-[1.02] text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[16px] cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Fornecedor'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* LIST GRID */
        <div className="space-y-6" id="suppliers-list-container">
          {/* Search */}
          <div className="bg-[#161618] rounded-[22px] border border-[rgba(242,239,235,0.1)] p-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#f2efeb]/40" />
              <input
                type="text"
                id="search-suppliers"
                placeholder="FILTRAR FORNECEDORES POR NOME, CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.05)] focus:border-[#EC0E78] text-xs text-[#f2efeb] outline-none transition-all placeholder-[#f2efeb]/30 font-mono-custom uppercase tracking-wider rounded-[16px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="suppliers-grid">
            {filteredSuppliers.map(s => {
              const providedProducts = products.filter(p => p.supplier_id === s.id);

              return (
                <div 
                  key={s.id}
                  className="bg-[#161618] rounded-[22px] border border-[rgba(242,239,235,0.1)] p-6 flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(242,239,235,0.05)] border border-[rgba(242,239,235,0.1)] flex items-center justify-center text-[#EC0E78]">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f2efeb] text-sm leading-normal">{s.name}</h4>
                          <span className="text-[10px] text-[#EC0E78] font-mono-custom font-bold">CNPJ: {s.cnpj}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold font-mono-custom uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          VERIFICADO
                        </span>

                        <button
                          onClick={() => handleDeleteSupplier(s.id, s.name)}
                          title="Remover Fornecedor"
                          className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#f2efeb]/60">
                      {s.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                          {s.phone}
                        </p>
                      )}
                      {s.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                          {s.email}
                        </p>
                      )}
                      {s.address && (
                        <p className="flex items-start gap-2 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-[#EC0E78] mt-0.5 flex-shrink-0" />
                          {s.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats provided */}
                  <div className="border-t border-[rgba(242,239,235,0.1)] pt-4 flex items-center justify-between text-xs">
                    <span className="text-[#f2efeb]/40 flex items-center gap-1 font-mono-custom uppercase tracking-wider text-[10px]">
                      <Briefcase className="w-3.5 h-3.5 text-[#EC0E78]" />
                      Produtos Fornecidos:
                    </span>
                    <strong className="text-[#f2efeb]/80 font-bold font-mono-custom uppercase tracking-wider text-[11px]">{providedProducts.length} itens no catálogo</strong>
                  </div>
                </div>
              );
            })}
            {filteredSuppliers.length === 0 && (
              <div className="col-span-2 py-12 text-center text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider text-xs">Nenhum parceiro ou fornecedor encontrado.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersView;
