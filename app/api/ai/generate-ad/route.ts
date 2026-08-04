import { GoogleGenAI } from "@google/genai";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter per IP window (15 requests per 1 minute)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 15;

  const current = rateLimitMap.get(ip);
  if (!current || now - current.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Não autorizado. Autenticação não configurada." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled gracefully in route handlers
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado. Autenticação necessária." },
        { status: 401 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Limite de requisições excedido. Por favor, aguarde um minuto." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const rawProductName = typeof body.productName === 'string' ? body.productName : '';
    const rawProductDesc = typeof body.productDescription === 'string' ? body.productDescription : '';
    const rawStyle = typeof body.style === 'string' ? body.style : 'Elegante';
    const productPrice = body.productPrice;

    // Sanitize and constrain input lengths to prevent prompt injection and buffer abuse
    const productName = rawProductName.slice(0, 150).replace(/[<>{}]/g, '').trim();
    const productDescription = rawProductDesc.slice(0, 1000).replace(/[<>{}]/g, '').trim();
    const style = rawStyle.slice(0, 50).replace(/[<>{}]/g, '').trim();

    if (!productName) {
      return NextResponse.json(
        { error: "O nome do produto é obrigatório." },
        { status: 400 }
      );
    }

    const formattedPrice = typeof productPrice === 'number'
      ? `R$ ${productPrice.toFixed(2).replace('.', ',')}`
      : (productPrice || 'Sob consulta');

    const styleInstructions: Record<string, string> = {
      'Romântico': 'Crie uma legenda apaixonada, carinhosa e romântica, perfeita para presentear quem você ama.',
      'Sensual': 'Crie uma legenda envolvente, provocante e sofisticada que desperte o desejo e a autoconfiança.',
      'Elegante': 'Crie uma legenda de altíssimo padrão, refinada, discreta e focada no luxo e na sofisticação.',
      'Premium': 'Crie uma legenda destacando a exclusividade, alta performance, qualidade superior e status do produto.',
      'Promoção': 'Crie uma legenda com senso de urgência, oferta imperdível e apelo para compra imediata.',
      'Engraçado': 'Crie uma legenda divertida, descontraída e bem-humorada com emojis e tom leve.',
      'Lançamento': 'Crie uma legenda anunciando com entusiasmo uma grande novidade e exclusividade de estoque.',
      'Black Friday': 'Crie uma legenda no estilo Black Friday com descontos chocantes, urgência extrema e emojis impactantes.',
      'Dia dos Namorados': 'Crie uma legenda temática de Dia dos Namorados focada em amor, cumplicidade e presente inesquecível.',
      'Dia das Mulheres': 'Crie uma legenda empolgante celebrando o amor-próprio, empoderamento, autoestima e cuidado feminino.',
      'Natal': 'Crie uma legenda festiva de Natal celebrando momentos especiais, presentes memoráveis e magia natalina.',
      'Ano Novo': 'Crie uma legenda vibrante de Réveillon focada em renovação, novas experiências e começar o ano com tudo.',
    };

    const styleContext = styleInstructions[style] || 'Crie um anúncio envolvente e persuasivo para este produto.';

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const prompt = `Você é um especialista em Copywriting e Marketing de Luxo para a marca "Pink Pulse".
Gere um texto de anúncio curto, altamente persuasivo e pronto para publicar no Instagram / WhatsApp para o produto:
- Nome: ${productName}
- Preço: ${formattedPrice}
- Descrição/Atributos: ${productDescription || 'Produto exclusivo de alta qualidade.'}
- Estilo desejado: ${style} (${styleContext})

Regras:
1. Inclua emojis estratégicos e elegantes.
2. Destaque os benefícios e sentimentos provocados pelo produto.
3. Termine com uma Chamada para Ação (Call to Action) para pedir via WhatsApp com envio discreto.
4. Mantenha a assinatura "Pink Pulse ✨".
5. Não adicione notas ou explicações fora do texto do anúncio. Retorne APENAS o texto do anúncio.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

        if (response.text && response.text.trim().length > 0) {
          return NextResponse.json({ adText: response.text.trim() });
        }
      } catch (err) {
        console.warn("Gemini API call warning, falling back to smart template:", err);
      }
    }

    // Smart Fallback Copies for offline/fallback mode
    const fallbacks: Record<string, string> = {
      'Romântico': `💖 Momentos inesquecíveis começam com detalhes especiais.\n\nSurpreenda quem faz seu coração bater mais forte com o **${productName}**!\n\n✨ ${productDescription || 'Design único e toque inigualável.'}\n💰 Por apenas: ${formattedPrice}\n📦 Embalagem 100% discreta e entrega rápida.\n\nGaranta o seu presente no WhatsApp da Pink Pulse! 💕`,
      'Sensual': `🔥 Desperte desejos ocultos e transforme suas noites em uma experiência inesquecível.\n\nConheça o **${productName}**: intensidade, toque aveludado e sensações únicas.\n\n✨ ${productDescription || 'Feito para momentos extraordinários.'}\n💰 Apenas ${formattedPrice}\n\n📦 Envio totalmente discreto e seguro.\n💬 Faça seu pedido agora no WhatsApp Pink Pulse! 💋`,
      'Elegante': `✨ A verdadeira definição de sofisticação e autocuidado.\n\nApresentamos o **${productName}** — pensado para quem não abre mão do máximo requinte.\n\n💎 ${productDescription || 'Acabamento premium e presença marcante.'}\n💰 Investimento: ${formattedPrice}\n\nPink Pulse — Seu momento, com todo o prestígio que você merece. 🥂`,
      'Premium': `🏆 Padrão Ouro de Qualidade | Pink Pulse\n\nO **${productName}** combina tecnologia de ponta, materiais nobres e sensações incomparáveis.\n\n⭐ ${productDescription || 'Edição limitada com acabamento exclusivo.'}\n💰 Valor VIP: ${formattedPrice}\n\nPeça já o seu e receba com total privacidade! 📦💖`,
      'Promoção': `🚨 OFERTA ESPECIAL PINK PULSE 🚨\n\nO queridinho **${productName}** está com preço imperdível!\n\n🔥 ${productDescription || 'Qualidade garantida e estoque limitado.'}\n💰 De R$ --- por APENAS: ${formattedPrice}\n\n⚡ Poucas unidades disponíveis! Clique no link do WhatsApp e garanta o seu antes que esgoste! ⏳`,
      'Engraçado': `Aviso importante: Este produto pode causar acessos graves de felicidade e noites muito bem aproveitadas! 😄🔥\n\n**${productName}** é o upgrade que sua rotina estava pedindo.\n\n✨ ${productDescription || '100% aprovado para dias incríveis.'}\n💰 R$ ${formattedPrice}\n\nEntregamos na sua porta em embalagem misteriosa! Vem de Zap! 🛍️✨`,
      'Lançamento': `✨ NOVIDADE EXCLUSIVA NA PINK PULSE ✨\n\nAcaba de chegar o **${productName}**!\n\n🆕 ${productDescription || 'Inovação, estilo e sofisticação em cada detalhe.'}\n💰 Lançamento especial: ${formattedPrice}\n\nSeja um dos primeiros a experimentar. Entre em contato e peça o seu! 💗`,
      'Black Friday': `🖤 BLACK PINK PULSE | PREÇO DE CHOCAR 🖤\n\nDesconto imbatível no **${productName}**!\n\n⚡ ${productDescription || 'A oportunidade perfeita para garantir o seu produto dos sonhos.'}\n💰 APENAS ${formattedPrice} (Preço exclusivo do lote!)\n\n📦 Estoque voando! Chama no Zap e aproveite! 🔥`,
      'Dia dos Namorados': `💘 O presente perfeito para acender a chama do amor!\n\nSurpreenda seu amor neste Dia dos Namorados com o **${productName}**.\n\n💖 ${productDescription || 'Criado para celebrar o amor e a paixão.'}\n💰 ${formattedPrice}\n\n🎁 Embalagem presenteável e envio sigiloso. Peça já na Pink Pulse!`,
      'Dia das Mulheres': `🌸 Celebre sua força, sua beleza e a sua liberdade de ser quem você é!\n\nPresenteie-se com o **${productName}** — um toque diário de amor-próprio e bem-estar.\n\n✨ ${productDescription || 'Você merece esse momento só seu.'}\n💰 ${formattedPrice}\n\nPink Pulse 💗`,
      'Natal': `🎄 MAGIA DE NATAL PINK PULSE 🎁\n\nTransforme a noite de Natal em um momento inesquecível com o **${productName}**.\n\n✨ ${productDescription || 'O presente perfeito para quem você ama (ou para você mesma!).'}\n💰 ${formattedPrice}\n\nGaranta a entrega a tempo das festas! Fale conosco no WhatsApp! 🎅💖`,
      'Ano Novo': `🎆 NOVO ANO, NOVAS EXPERIÊNCIAS! 🥂\n\nComece 2026 renovando sua energia e prazer com o **${productName}**!\n\n✨ ${productDescription || 'Sensações marcantes para abrir o ano com o pé direito.'}\n💰 ${formattedPrice}\n\nPink Pulse — Viva o melhor de cada momento! 💕`
    };

    const fallbackAd = fallbacks[style] || fallbacks['Elegante'];
    return NextResponse.json({ adText: fallbackAd });

  } catch (err: unknown) {
    console.error("Error generating ad:", err);
    return NextResponse.json(
      { error: "Erro ao gerar anúncio." },
      { status: 500 }
    );
  }
}
