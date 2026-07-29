import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Pink Pulse — Catálogo VIP & Sex Shop Premium',
  description: 'Confira nossos produtos exclusivos com embalagem 100% discreta, atendimento humanizado e entrega rápida via WhatsApp.',
  openGraph: {
    title: 'Pink Pulse — Catálogo VIP & Sex Shop Premium',
    description: 'Produtos exclusivos, sigilo total e entrega 100% discreta. Peça diretamente pelo WhatsApp.',
    siteName: 'Pink Pulse',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
