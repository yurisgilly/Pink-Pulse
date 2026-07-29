'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { useERP } from '@/contexts/erp.context';
import { User, UserRole } from '@/types/erp.types';
import { uploadImageToStorage, validateImageFile } from '@/lib/storage';
import { Shield, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, Mail, Phone, Calendar, UserCheck, Camera, Image as ImageIcon, Upload, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const UsersView: React.FC = () => {
  const { users, currentUser, createUser, updateUser, deleteUser, refreshAll } = useERP();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Quick photo update modal state (Real File Upload)
  const [photoModalUser, setPhotoModalUser] = useState<User | null>(null);
  const [selectedUserFile, setSelectedUserFile] = useState<File | null>(null);
  const [userPreviewUrl, setUserPreviewUrl] = useState<string>('');
  const [userFileError, setUserFileError] = useState<string | null>(null);
  const [isUserUploading, setIsUserUploading] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userFormFile, setUserFormFile] = useState<File | null>(null);
  const [userFormFileError, setUserFormFileError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.VENDEDOR);
  const [active, setActive] = useState(true);

  // Filter
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAvatarUrl('');
    setUserFormFile(null);
    setUserFormFileError(null);
    setRole(UserRole.VENDEDOR);
    setActive(true);
    setEditingUser(null);
    setIsAddMode(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setAvatarUrl(user.avatar_url || '');
    setUserFormFile(null);
    setUserFormFileError(null);
    setRole(user.role);
    setActive(user.active);
    setIsAddMode(false);
  };

  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUserFormFileError(null);
    if (!file) return;

    const err = validateImageFile(file);
    if (err) {
      setUserFormFileError(err);
      setUserFormFile(null);
      return;
    }

    setUserFormFile(file);
    setUserAvatarPreview(URL.createObjectURL(file));
  };

  const setUserAvatarPreview = (url: string) => {
    setAvatarUrl(url);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }

    try {
      let finalAvatarUrl = avatarUrl;
      if (userFormFile) {
        finalAvatarUrl = await uploadImageToStorage('user-avatars', userFormFile, avatarUrl);
      }

      if (editingUser) {
        const success = await updateUser(editingUser.id, {
          name,
          email,
          phone,
          avatar_url: finalAvatarUrl || undefined,
          role,
          active
        });
        if (success) {
          alert('Usuário e foto de perfil atualizados com sucesso!');
          resetForm();
        } else {
          alert('Falha ao atualizar usuário.');
        }
      } else {
        const result = await createUser({
          name,
          email,
          phone,
          avatar_url: finalAvatarUrl || undefined,
          role,
          active
        });
        if (result) {
          alert(`Usuário "${result.name}" criado com sucesso!`);
          resetForm();
        } else {
          alert('Falha ao criar usuário.');
        }
      }
    } catch (err: any) {
      alert(`Erro ao salvar usuário: ${err?.message || err}`);
    }
  };

  const handleUserModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUserFileError(null);
    if (!file) return;

    const err = validateImageFile(file);
    if (err) {
      setUserFileError(err);
      setSelectedUserFile(null);
      return;
    }

    setSelectedUserFile(file);
    const localPreview = URL.createObjectURL(file);
    setUserPreviewUrl(localPreview);
  };

  const handleQuickPhotoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoModalUser) return;
    if (!selectedUserFile && !userPreviewUrl) {
      setUserFileError('Por favor, selecione um arquivo de imagem.');
      return;
    }

    setIsUserUploading(true);
    setUserFileError(null);

    try {
      let finalAvatarUrl = userPreviewUrl;
      if (selectedUserFile) {
        finalAvatarUrl = await uploadImageToStorage('user-avatars', selectedUserFile, photoModalUser.avatar_url);
      }

      const success = await updateUser(photoModalUser.id, { avatar_url: finalAvatarUrl });
      if (success) {
        alert(`Foto do perfil de ${photoModalUser.name} atualizada com sucesso!`);
        setPhotoModalUser(null);
        setSelectedUserFile(null);
        setUserPreviewUrl('');
      } else {
        setUserFileError('Falha ao salvar foto do perfil.');
      }
    } catch (err: any) {
      setUserFileError(err?.message || 'Erro ao enviar foto do perfil.');
    } finally {
      setIsUserUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert('Você não pode excluir o seu próprio usuário logado!');
      return;
    }
    if (confirm('Tem certeza de que deseja excluir permanentemente este usuário?')) {
      const success = await deleteUser(id);
      if (success) {
        alert('Usuário excluído!');
      } else {
        alert('Erro ao excluir usuário.');
      }
    }
  };

  const toggleUserStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode desativar seu próprio usuário!');
      return;
    }
    await updateUser(user.id, { active: !user.active });
  };

  return (
    <div className="space-y-6 font-sans text-[#f2efeb]" id="users-view-container">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-[#f2efeb] tracking-tight uppercase flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#E6007E]" />
            Controle de Acesso & Usuários
          </h1>
          <p className="text-[#f2efeb]/50 text-xs font-mono-custom uppercase tracking-wider mt-1">
            Gerenciamento de credenciais, permissões e status dos funcionários
          </p>
        </div>
        
        {!isAddMode && !editingUser && (
          <button
            onClick={() => {
              resetForm();
              setIsAddMode(true);
            }}
            className="flex items-center gap-2 bg-[#E6007E] text-[#111113] py-3 px-5 text-xs font-mono-custom font-bold uppercase tracking-widest rounded-[4px] hover:bg-[#ff4fa0] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo
          </button>
        )}
      </div>

      {(isAddMode || editingUser) ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] shadow-2xl p-6 md:p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-lg font-display font-bold text-[#f2efeb] uppercase tracking-tight mb-6">
            {editingUser ? `Editar Usuário: ${editingUser.name}` : 'Cadastrar Novo Usuário'}
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] px-4 py-3.5 rounded-[4px] outline-none transition-all placeholder:text-[#f2efeb]/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider mb-2">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: joao@pinkpulse.com"
                  className="w-full bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#E6007E] text-xs text-[#f2efeb] px-4 py-3.5 rounded-[4px] outline-none transition-all placeholder:text-[#f2efeb]/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">
                  Telefone de Contato
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ex: (11) 99999-9999"
                  className="w-full bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] px-4 py-3.5 rounded-[4px] outline-none transition-all placeholder:text-[#f2efeb]/30"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">
                  Foto de Perfil (JPG, PNG, WEBP - Máx 5MB)
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="user-form-photo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleFormFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="user-form-photo-upload"
                    className="w-full flex items-center justify-between px-4 py-3 bg-[rgba(242,239,235,0.03)] hover:bg-[rgba(242,239,235,0.08)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] rounded-[4px] cursor-pointer font-mono-custom"
                  >
                    <span className="truncate">{userFormFile ? userFormFile.name : 'Selecionar imagem do computador'}</span>
                    <Upload className="w-4 h-4 text-[#EC0E78] shrink-0 ml-2" />
                  </label>
                </div>
                {userFormFileError && (
                  <p className="text-[10px] text-rose-400 mt-1 font-mono-custom">{userFormFileError}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] text-xs text-[#f2efeb] px-4 py-3.5 rounded-[4px] outline-none transition-all [&>option]:bg-[#18181A]"
                >
                  <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                  <option value={UserRole.GERENTE}>Gerente (Financeiro + Vendas + Estoque)</option>
                  <option value={UserRole.ESTOQUE}>Estoque (Entradas + Auditoria + Alertas)</option>
                  <option value={UserRole.VENDEDOR}>Vendedor (Terminal PDV + Estoque Consulta)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[rgba(242,239,235,0.03)] p-4 rounded-[4px] border border-[rgba(242,239,235,0.1)]">
              <input
                type="checkbox"
                id="user-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-[#E6007E] bg-black border-[rgba(242,239,235,0.2)] rounded focus:ring-[#E6007E] cursor-pointer"
              />
              <label htmlFor="user-active" className="text-xs font-medium text-[#f2efeb]/80 cursor-pointer select-none">
                Usuário Ativo (Permitir login no ERP)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(242,239,235,0.1)]">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3.5 bg-[rgba(242,239,235,0.03)] hover:bg-[rgba(242,239,235,0.08)] text-[#f2efeb]/70 text-xs font-mono-custom font-bold uppercase tracking-wider rounded-[4px] transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3.5 bg-[#E6007E] text-[#111113] text-xs font-mono-custom font-bold uppercase tracking-widest rounded-[4px] hover:bg-[#ff4fa0] transition-all cursor-pointer"
              >
                {editingUser ? 'Salvar Alterações' : 'Criar Colaborador'}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-[#f2efeb]/40" />
            <input
              type="text"
              placeholder="Buscar colaborador por nome, e-mail ou perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-[#f2efeb] placeholder:text-[#f2efeb]/30"
            />
          </div>

          {/* Table Container */}
          <div className="bg-[#18181A] rounded-[4px] border border-[rgba(242,239,235,0.1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black/20 border-b border-[rgba(242,239,235,0.1)]">
                    <th className="text-left text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      Colaborador
                    </th>
                    <th className="text-left text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      E-mail / Contato
                    </th>
                    <th className="text-left text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      Perfil
                    </th>
                    <th className="text-left text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      Status
                    </th>
                    <th className="text-left text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      Criação
                    </th>
                    <th className="text-right text-[10px] font-mono-custom font-bold text-[#E6007E] uppercase tracking-wider p-5">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(242,239,235,0.05)]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-xs text-[#f2efeb]/40 font-mono-custom uppercase">
                        Nenhum colaborador localizado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[rgba(242,239,235,0.02)] transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EC0E78]/30 relative shrink-0 shadow-md">
                                <NextImage 
                                  src={user.avatar_url} 
                                  alt={user.name} 
                                  width={40} 
                                  height={40} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#EC0E78]/10 border border-[#EC0E78]/20 flex items-center justify-center font-bold text-[#EC0E78] text-sm font-display uppercase shrink-0">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-xs text-[#f2efeb]">{user.name}</div>
                              {user.id === currentUser?.id && (
                                <span className="inline-flex items-center gap-1 bg-[#EC0E78]/10 text-[#EC0E78] text-[9px] font-mono-custom font-bold uppercase px-2 py-0.5 rounded-[4px] mt-1">
                                  <UserCheck className="w-2.5 h-2.5" /> Você Logado
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="space-y-1">
                            <div className="text-xs text-[#f2efeb]/80 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-xs text-[#f2efeb]/50 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center text-[10px] font-mono-custom font-bold uppercase px-3 py-1 rounded-[4px] ${
                            user.role === UserRole.ADMIN 
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : user.role === UserRole.GERENTE
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              : user.role === UserRole.ESTOQUE
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-5">
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                          >
                            {user.active ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono-custom font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded-[4px] border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 font-mono-custom font-bold uppercase bg-rose-500/10 px-2 py-1 rounded-[4px] border border-rose-500/20">
                                <XCircle className="w-3.5 h-3.5 text-[#EC0E78]" /> Inativo
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-5 text-xs text-[#f2efeb]/50 font-mono-custom">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#f2efeb]/30" />
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setPhotoModalUser(user);
                                setSelectedUserFile(null);
                                setUserPreviewUrl(user.avatar_url || '');
                                setUserFileError(null);
                              }}
                              className="px-2.5 py-1.5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 font-bold text-[10px] font-mono-custom uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 rounded-[4px]"
                              title="Trocar Foto do Perfil"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#EC0E78]" />
                              <span>Trocar Foto</span>
                            </button>
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-[#f2efeb]/60 hover:text-[#EC0E78] hover:bg-[rgba(242,239,235,0.05)] rounded-[4px] transition-all cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-[#f2efeb]/60 hover:text-[#EC0E78] hover:bg-[rgba(242,239,235,0.05)] rounded-[4px] transition-all cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE USER AVATAR OVERLAY MODAL */}
      {photoModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-user-photo-overlay">
          <div className="bg-[#18181A] rounded-[22px] max-w-md w-full border border-[#ECEEF5]/20 p-6 shadow-2xl animate-scale-up text-[#f2efeb] space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#EC0E78]/10 text-[#EC0E78] rounded-[12px] border border-[#EC0E78]/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display uppercase tracking-tight text-white">Trocar Foto do Perfil</h3>
                  <p className="text-[10px] text-[#64748B] font-mono-custom uppercase">{photoModalUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isUserUploading) setPhotoModalUser(null);
                }}
                className="text-[#64748B] hover:text-white text-xs font-bold font-mono-custom cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Avatar Preview Area */}
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-black/40 rounded-[16px] border border-white/10">
              <div className="w-28 h-28 rounded-full bg-white/5 border border-white/20 overflow-hidden relative shadow-inner flex items-center justify-center">
                {userPreviewUrl ? (
                  <NextImage 
                    src={userPreviewUrl} 
                    alt="Preview Avatar" 
                    width={112} 
                    height={112} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-2xl font-extrabold text-[#EC0E78] font-display uppercase">
                    {photoModalUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="text-center">
                <span className="text-[10px] font-mono-custom text-[#64748B] uppercase block">
                  {selectedUserFile ? selectedUserFile.name : 'Pré-visualização do Avatar'}
                </span>
                {selectedUserFile && (
                  <span className="text-[9px] font-mono-custom text-[#EC0E78] font-bold">
                    {(selectedUserFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleQuickPhotoSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">
                  Selecionar Foto (JPG, PNG, WEBP - Máx 5MB)
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="user-modal-photo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    onChange={handleUserModalFileChange}
                    disabled={isUserUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="user-modal-photo-upload"
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-dashed ${userFileError ? 'border-rose-500/80 text-rose-300' : 'border-[#EC0E78]/50 text-white'} rounded-[14px] font-mono-custom text-xs font-bold uppercase cursor-pointer transition-all`}
                  >
                    <Upload className="w-4 h-4 text-[#EC0E78]" />
                    <span>{selectedUserFile ? 'Trocar Arquivo Selecionado' : 'Selecionar Imagem do Computador'}</span>
                  </label>
                </div>
              </div>

              {userFileError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-[12px] text-rose-300 text-[11px] font-mono-custom flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{userFileError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={isUserUploading}
                  onClick={() => setPhotoModalUser(null)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold font-mono-custom uppercase tracking-wider rounded-[14px] cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUserUploading || (!selectedUserFile && !userPreviewUrl)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] text-white text-xs font-bold font-mono-custom uppercase tracking-wider rounded-[14px] shadow-[0_4px_14px_rgba(236,14,120,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUserUploading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  <span>{isUserUploading ? 'Enviando...' : 'Salvar Foto de Perfil'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersView;
