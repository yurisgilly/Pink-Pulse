'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useERP } from '@/contexts/erp.context';
import logoImg from '@/assets/sem coraçao.png';
import { Lock, Mail, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginView: React.FC = () => {
  const { login } = useERP();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Falha ao autenticar.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111113] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none" id="login-container">
      {/* Background soft pink glows */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[#EC0E78]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-[#EC0E78]/10 blur-[150px] pointer-events-none" />

      {/* Main Login Card with Split 2-Column Layout */}
      <div className="w-full max-w-5xl bg-[#18181A] border border-[rgba(242,239,235,0.1)] rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10" id="login-card">
        
        {/* Left Form Section */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[rgba(242,239,235,0.1)]">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-4 mb-8" id="login-header">
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-[#212124] rounded-[16px] border border-white/10 p-2 shadow-md">
                <Image 
                  src={logoImg} 
                  alt="Pink Pulse Logo" 
                  className="w-full h-full object-contain"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="text-2xl font-display font-extrabold text-[#f2efeb] tracking-tight uppercase">
                  Pink Pulse
                </h2>
                <p className="text-[10px] font-mono-custom text-[#EC0E78] font-bold uppercase tracking-[0.2em]">
                  ERP Premium para Sex Shop
                </p>
              </div>
            </div>

            {/* Login Form */}
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-6" 
              onSubmit={handleSubmit}
            >
              {errorMessage && (
                <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-[12px] flex gap-3 text-xs text-rose-300 animate-pulse">
                  <AlertCircle className="w-4 h-4 text-[#EC0E78] shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider mb-2">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#f2efeb]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: manoela@pinkpulse.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] focus:bg-white/5 text-xs text-[#f2efeb] rounded-[14px] outline-none transition-all duration-200 placeholder:text-[#f2efeb]/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-[10px] font-mono-custom font-bold text-[#EC0E78] uppercase tracking-wider">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Para redefinir sua senha, entre em contato com o suporte de TI Pink Pulse.')}
                    className="text-[10px] font-mono-custom font-bold text-[#f2efeb]/40 hover:text-[#EC0E78] uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#f2efeb]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-[rgba(242,239,235,0.03)] border border-[rgba(242,239,235,0.1)] focus:border-[#EC0E78] focus:bg-white/5 text-xs text-[#f2efeb] rounded-[14px] outline-none transition-all duration-200 placeholder:text-[#f2efeb]/30"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 bg-gradient-to-r from-[#EC0E78] to-[#FF4FA0] hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_16px_rgba(236,14,120,0.35)] text-white transition-all duration-200 text-xs font-mono-custom font-bold uppercase tracking-widest rounded-[16px] cursor-pointer border-none disabled:opacity-50"
                >
                  Entrar no App
                </button>
              </div>
            </motion.form>
          </div>

          <div className="mt-8 pt-6 border-t border-[rgba(242,239,235,0.1)] text-center">
            <p className="text-[10px] text-[#f2efeb]/40 font-mono-custom uppercase tracking-wider flex items-center justify-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#EC0E78]" />
              SISTEMA CORPORATIVO SEGURO
            </p>
          </div>
        </div>

        {/* Right Hero Section - Pink Pulse Logo Branding */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#1F0D19] via-[#2A081D] to-[#8B0D4E] p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px] lg:min-h-[500px]" id="login-hero-logo">
          {/* Ambient light orb */}
          <div className="absolute w-80 h-80 rounded-full bg-[#EC0E78]/20 blur-[90px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center drop-shadow-[0_10px_35px_rgba(236,14,120,0.35)]"
            >
              <Image 
                src={logoImg} 
                alt="Pink Pulse Logo Hero" 
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                priority
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <div className="max-w-xs space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono-custom text-white font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EC0E78]" />
                Alta Performance & Luxo
              </div>
              <h3 className="text-lg font-display font-extrabold text-white uppercase tracking-tight">
                Gestão Inteligente Pink Pulse
              </h3>
              <p className="text-xs text-[#f2efeb]/70 font-sans leading-relaxed">
                Terminal corporativo unificado para gestão de vendas, estoque e automação financeira.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
