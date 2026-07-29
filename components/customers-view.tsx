'use client';

import React, { useState } from 'react';
import { useERP } from '@/contexts/erp.context';
import { ERPRepository } from '@/repositories/erp.repository';
import { Customer } from '@/types/erp.types';
import { parseBirthday } from '@/lib/utils';
import { 
  Users, Plus, Search, Calendar, Phone, Award, Mail, Edit2, Trash2, X, Check, FileText, Gift, Sparkles, Copy, MessageCircle 
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, sales, updateCustomer, deleteCustomer, refreshAll } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Create Form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custDocument, setCustDocument] = useState('');
  const [custBirthday, setCustBirthday] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Edit Form state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDocument, setEditDocument] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;
    const result = await ERPRepository.createCustomer({
      name: custName,
      phone: custPhone || undefined,
      email: custEmail || undefined,
      document: custDocument || undefined,
      birthday: custBirthday || undefined,
      notes: custNotes || undefined
    });
    if (result) {
      alert(`Cliente VIP "${result.name}" cadastrado com sucesso!`);
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustDocument('');
      setCustBirthday('');
      setCustNotes('');
      setIsAdding(false);
      refreshAll();
    }
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setEditName(c.name || '');
    setEditPhone(c.phone || '');
    setEditEmail(c.email || '');
    setEditDocument(c.document || '');
    setEditBirthday(c.birthday || '');
    setEditNotes(c.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName) return;
    setIsSubmittingEdit(true);
    try {
      const success = await updateCustomer(editingCustomer.id, {
        name: editName,
        phone: editPhone || undefined,
        email: editEmail || undefined,
        document: editDocument || undefined,
        birthday: editBirthday || undefined,
        notes: editNotes || undefined
      });

      if (success) {
        alert(`Cadastro do cliente "${editName}" atualizado com sucesso!`);
        setEditingCustomer(null);
      } else {
        alert('Erro ao atualizar o cadastro do cliente.');
      }
    } catch (err: any) {
      alert(`Erro: ${err?.message || 'Falha ao salvar cliente'}`);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro do cliente VIP "${name}"?`)) {
      const success = await deleteCustomer(id);
      if (success) {
        alert(`Cliente "${name}" excluído com sucesso.`);
      } else {
        alert('Erro ao excluir cliente.');
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-[#f2efeb]" id="customers-screen">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" id="customers-header">
        <div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight uppercase text-[#E6007E]">Clientes VIP</h2>
          <p className="text-sm text-[#f2efeb]/50 font-mono-custom uppercase tracking-wider mt-1.5">Gestão de carteira qualificada, aniversários e preferências de compra.</p>
        </div>

        <button
          id="btn-toggle-add-customer"
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-3 border border-[#E6007E] bg-[#E6007E] hover:bg-transparent text-[#111113] hover:text-[#E6007E] transition-all text-[11px] font-bold font-mono-custom uppercase tracking-widest rounded-[4px] cursor-pointer"
        >
          {isAdding ? 'Ver Todos' : 'CADASTRAR CLIENTE'}
        </button>
      </div>

      {isAdding ? (
        /* CREATE FORM */
        <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-8 max-w-2xl" id="new-customer-container">
          <div className="mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E6007E]" />
            <h2 className="text-xs font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider">Novo Cadastro de Cliente VIP</h2>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Nome Completo *</label>
                <input 
                  type="text" 
                  value={custName} 
                  onChange={e => setCustName(e.target.value)} 
                  placeholder="Ex: Alessandra Ambrósio" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Celular / WhatsApp</label>
                <input 
                  type="text" 
                  value={custPhone} 
                  onChange={e => setCustPhone(e.target.value)} 
                  placeholder="(11) 99999-9999" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">E-mail</label>
                <input 
                  type="email" 
                  value={custEmail} 
                  onChange={e => setCustEmail(e.target.value)} 
                  placeholder="alessandra@exemplo.com" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">CPF / Documento</label>
                <input 
                  type="text" 
                  value={custDocument} 
                  onChange={e => setCustDocument(e.target.value)} 
                  placeholder="000.000.000-00" 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Aniversário</label>
                <input 
                  type="date" 
                  value={custBirthday} 
                  onChange={e => setCustBirthday(e.target.value)} 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Observações / Preferências</label>
                <input 
                  type="text" 
                  value={custNotes} 
                  onChange={e => setCustNotes(e.target.value)} 
                  placeholder="Prefere fragrâncias doces, compra recorrente..." 
                  className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[4px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                id="btn-cancel-create-customer"
                onClick={() => setIsAdding(false)}
                className="px-5 py-3 border border-[rgba(242,239,235,0.1)] text-[#f2efeb]/80 text-[11px] font-bold font-mono-custom uppercase tracking-wider hover:bg-white/5 rounded-[4px]"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="btn-submit-create-customer"
                className="px-5 py-3 bg-[#E6007E] border border-[#E6007E] text-[#111113] hover:bg-transparent hover:text-[#E6007E] text-[11px] font-bold font-mono-custom uppercase tracking-wider transition-all rounded-[4px]"
              >
                Salvar Cliente VIP
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* CLIENTS GRID */
        <div className="space-y-6" id="customers-list-container">
          {/* Search bar */}
          <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-5 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#f2efeb]/40" />
              <input
                type="text"
                id="search-customers"
                placeholder="PESQUISAR CLIENTE POR NOME OU TELEFONE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.05)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none transition-all placeholder-[#f2efeb]/30 font-mono-custom uppercase tracking-wide rounded-[4px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="customers-grid">
            {filteredCustomers.map(c => {
              // Calcular faturamento do cliente
              const clientSales = sales.filter(s => s.customer_id === c.id && s.status === 'completed');
              const totalSpent = clientSales.reduce((acc, s) => acc + s.total_amount, 0);
              const totalPurchases = clientSales.length;

              return (
                <div 
                  key={c.id}
                  className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-6 hover:translate-y-[-2px] transition-all duration-300 space-y-5 flex flex-col justify-between min-h-[320px]"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-[#E6007E] text-[#E6007E] flex items-center justify-center font-display font-extrabold text-sm leading-none rounded-none">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#f2efeb] text-sm leading-tight uppercase font-display">{c.name}</h4>
                          <span className="text-[10px] text-[#f2efeb]/40 font-mono-custom tracking-wider block mt-0.5">ID: VIP-{c.id.split('-')[0].toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {totalSpent > 1000 ? (
                          <span className="flex items-center gap-1 bg-[#E6007E] text-[#111113] text-[9px] font-bold font-mono-custom px-2 py-0.5 uppercase tracking-wider rounded-none">
                            CLIENTE VIP
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-[rgba(242,239,235,0.05)] text-[#f2efeb]/40 border border-[rgba(242,239,235,0.1)] text-[9px] font-bold font-mono-custom px-2 py-0.5 uppercase tracking-wider rounded-none">
                            PADRÃO
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Editar Cadastro do Cliente"
                          className="p-1.5 bg-white/5 hover:bg-[#E6007E]/20 text-[#f2efeb]/70 hover:text-[#E6007E] border border-[rgba(242,239,235,0.1)] hover:border-[#E6007E]/40 rounded-[4px] cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          title="Excluir Cliente"
                          className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-[#f2efeb]/70 hover:text-rose-400 border border-[rgba(242,239,235,0.1)] hover:border-rose-500/40 rounded-[4px] cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contacts list */}
                    <div className="space-y-2 text-xs text-[#f2efeb]/60 font-mono-custom uppercase tracking-wide">
                      {c.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[#E6007E]" />
                          {c.phone}
                        </p>
                      )}
                      {c.email && (
                        <p className="flex items-center gap-2 truncate lowercase">
                          <Mail className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                          {c.email}
                        </p>
                      )}
                      {c.birthday && (
                        <div className="space-y-1">
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#E6007E]/70" />
                            ANIV: {c.birthday.split('-').reverse().join('/')}
                          </p>
                          {(() => {
                            const parsed = parseBirthday(c.birthday);
                            const now = new Date();
                            if (parsed && parsed.month === (now.getMonth() + 1)) {
                              const isToday = parsed.day === now.getDate();
                              const cleanPhone = c.phone?.replace(/\D/g, '');
                              const whatsappUrl = cleanPhone 
                                ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${c.name}! A equipe Pink Pulse te deseja um feliz aniversário! ✨ Usando o cupom "PARABENS10" você tem 10% OFF em suas compras este mês! 💖`)}`
                                : null;

                              return (
                                <div className="p-3 bg-gradient-to-r from-[#EC0E78]/15 via-[#FF4FA0]/10 to-transparent border border-[#EC0E78]/30 rounded-[12px] space-y-2 mt-2">
                                  <div className="flex items-center gap-1.5 text-[#FF4FA0] font-bold text-[10px] uppercase tracking-wider">
                                    <Gift className="w-3.5 h-3.5 animate-bounce" />
                                    <span>{isToday ? '🎉 HOJE É O ANIVERSÁRIO!' : '🎂 ANIVERSARIANTE DO MÊS'}</span>
                                  </div>
                                  <p className="text-[10px] text-white/80 leading-snug">
                                    {isToday ? 'Aniversário hoje! Envie os parabéns e o cupom VIP.' : `Faz aniversário dia ${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}.`}
                                  </p>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText('PARABENS10');
                                        alert('Cupom PARABENS10 copiado para a área de transferência!');
                                      }}
                                      className="px-2.5 py-1 bg-[#EC0E78] hover:bg-[#FF4FA0] text-white text-[9px] font-bold uppercase rounded-[8px] flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                      <span>PARABENS10</span>
                                    </button>
                                    {whatsappUrl && (
                                      <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold uppercase rounded-[8px] flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <MessageCircle className="w-2.5 h-2.5" />
                                        <span>WhatsApp</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Preferences notes */}
                    {c.notes && (
                      <div className="p-4 bg-[rgba(242,239,235,0.02)] border border-[rgba(242,239,235,0.05)] text-xs text-[#f2efeb]/70 flex items-start gap-2 italic">
                        <p className="leading-relaxed font-sans">&ldquo;{c.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Pricing stats bottom */}
                  <div className="border-t border-[rgba(242,239,235,0.1)] pt-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#f2efeb]/40 block text-[9px] uppercase font-mono-custom tracking-wider">Total Gasto</span>
                      <strong className="text-[#E6007E] font-bold text-sm font-mono-custom">R$ {totalSpent.toFixed(2)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[#f2efeb]/40 block text-[9px] uppercase font-mono-custom tracking-wider">Compras</span>
                      <strong className="text-[#f2efeb] font-bold text-sm font-mono-custom">{totalPurchases} PED.</strong>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredCustomers.length === 0 && (
              <div className="col-span-3 py-12 text-center text-[#f2efeb]/40 font-mono-custom">Nenhum cliente qualificado encontrado.</div>
            )}
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL OVERLAY */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-customer-overlay">
          <div className="bg-[#18181A] rounded-[22px] max-w-xl w-full border border-[rgba(242,239,235,0.15)] p-6 sm:p-8 shadow-2xl animate-scale-up text-[#f2efeb] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#E6007E]/10 text-[#E6007E] rounded-[12px] border border-[#E6007E]/20">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display uppercase tracking-tight text-white">Editar Cadastro do Cliente</h3>
                  <p className="text-[10px] text-[#64748B] font-mono-custom uppercase tracking-wider">ID: VIP-{editingCustomer.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-[#64748B] hover:text-white text-xs font-bold font-mono-custom p-1.5 cursor-pointer rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Nome Completo *</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    placeholder="Nome do Cliente" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Celular / WhatsApp</label>
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)} 
                    placeholder="(11) 99999-9999" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">E-mail</label>
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={e => setEditEmail(e.target.value)} 
                    placeholder="cliente@exemplo.com" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">CPF / Documento</label>
                  <input 
                    type="text" 
                    value={editDocument} 
                    onChange={e => setEditDocument(e.target.value)} 
                    placeholder="000.000.000-00" 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Data de Aniversário</label>
                  <input 
                    type="date" 
                    value={editBirthday} 
                    onChange={e => setEditBirthday(e.target.value)} 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">Observações / Preferências</label>
                  <textarea 
                    rows={3}
                    value={editNotes} 
                    onChange={e => setEditNotes(e.target.value)} 
                    placeholder="Preferências de fragrâncias, produtos favoritos, histórico..." 
                    className="w-full px-4 py-3 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] outline-none rounded-[14px] resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={() => setEditingCustomer(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold font-mono-custom uppercase tracking-wider rounded-[14px] cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit || !editName}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white text-xs font-bold font-mono-custom uppercase tracking-wider rounded-[14px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomersView;
