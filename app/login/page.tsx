'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ERPProvider, useERP } from '@/contexts/erp.context';
import LoginView from '@/components/login-view';

function LoginContent() {
  const { currentUser, loading } = useERP();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111113] flex flex-col items-center justify-center text-xs font-mono-custom text-[#EC0E78] uppercase tracking-widest">
        <div className="w-8 h-8 rounded-full border-2 border-[#EC0E78] border-t-transparent animate-spin mb-4" />
        Carregando Sistema Admin...
      </div>
    );
  }

  return <LoginView />;
}

export default function LoginPage() {
  return (
    <ERPProvider>
      <LoginContent />
    </ERPProvider>
  );
}
