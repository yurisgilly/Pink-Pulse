import { PublicProduct, PublicCategory, PublicCatalogSettings } from '@/types/public-catalog.types';
import { Product, Category } from '@/types/erp.types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from './default-data';
import { isSupabaseConfigured, supabase } from './supabase';

const SETTINGS_KEY = 'pink_pulse_public_catalog_settings';

export const DEFAULT_PUBLIC_SETTINGS: PublicCatalogSettings = {
  enabled: true,
  storeName: 'Pink Pulse',
  tagline: 'Desejo • Prazer • Conexão.',
  description: 'Produtos selecionados com qualidade, discrição e segurança. Entrega totalmente discreta.',
  whatsappNumber: '24999092402',
  whatsappMessageTemplate: 'Olá!\n\nTenho interesse no seguinte produto:\n\nNome:\n{nome}\n\nPreço:\nR$ {preco}\n\nGostaria de fazer meu pedido.',
  instagramUrl: 'https://instagram.com/lojapinkpulse',
  emailContact: 'contato@pinkpulse.com.br',
  banner: {
    enabled: true,
    title: 'Desperte Novas Experiências',
    subtitle: 'Na Pink Pulse, você encontra produtos selecionados com qualidade, discrição e atendimento personalizado para tornar cada momento ainda mais especial.',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'Ver Seleção Especial',
    buttonLink: '#destaques',
    bgColor: '#8B0D4E'
  },
  featuredCategoryIds: ['cat-1', 'cat-2', 'cat-3', 'cat-4'],
  featuredProductIds: ['prod-1', 'prod-2', 'prod-3', 'prod-7']
};

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getPublicCatalogSettings(): PublicCatalogSettings {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber === '24999600366' || parsed.whatsappNumber === '5511999998888') {
          parsed.whatsappNumber = '24999092402';
        }
        return { ...DEFAULT_PUBLIC_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Error loading public catalog settings:', e);
    }
  }
  return DEFAULT_PUBLIC_SETTINGS;
}

export function savePublicCatalogSettings(settings: PublicCatalogSettings): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving public catalog settings:', e);
    }
  }
}

// Convert internal Product to safe PublicProduct (Security Projection)
export function sanitizeToPublicProduct(
  p: Product, 
  categoryMap: Record<string, Category> = {}
): PublicProduct {
  const category = p.category_id ? categoryMap[p.category_id] : undefined;
  const catName = category?.name || 'Acessórios';
  const catSlug = slugify(catName);
  
  // Assign deterministic or configured badge
  let badge: PublicProduct['badge'] = null;
  const pNameLower = p.name.toLowerCase();
  if (pNameLower.includes('kit') || pNameLower.includes('secreta')) {
    badge = 'Mais vendido';
  } else if (pNameLower.includes('body') || pNameLower.includes('velvet')) {
    badge = 'Lançamento';
  } else if (pNameLower.includes('gel') || pNameLower.includes('loka')) {
    badge = 'Promoção';
  } else if (pNameLower.includes('plug') || pNameLower.includes('cristal')) {
    badge = 'Novo';
  }

  // Tags list derived from brand, category, name
  const tags: string[] = [];
  if (p.brand) tags.push(p.brand);
  if (catName) tags.push(catName);
  if (badge) tags.push(badge);

  return {
    id: p.id,
    name: p.name,
    description: p.description || 'Produto exclusivo de altíssima qualidade com entrega 100% discreta.',
    category_id: p.category_id || '',
    category_name: catName,
    category_slug: catSlug,
    sell_price: Number(p.sell_price || 0),
    image_url: p.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
    images: p.image_url ? [p.image_url] : [],
    in_stock: p.stock > 0, // ONLY boolean exposed, never exact stock quantity!
    brand: p.brand || 'Pink Pulse',
    badge,
    tags,
    slug: slugify(p.name)
  };
}

export async function fetchPublicProducts(): Promise<PublicProduct[]> {
  try {
    let rawProducts: Product[] = [];
    let rawCategories: Category[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: pData } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');
      const { data: cData } = await supabase.from('categories').select('*');

      rawProducts = (pData || []) as Product[];
      rawCategories = (cData || []) as Category[];
    } else {
      // Local Storage / Fallback mode
      if (typeof window !== 'undefined') {
        try {
          const savedProducts = localStorage.getItem('pink_pulse_products');
          if (savedProducts) {
            rawProducts = JSON.parse(savedProducts);
          }
          const savedCategories = localStorage.getItem('pink_pulse_categories');
          if (savedCategories) {
            rawCategories = JSON.parse(savedCategories);
          }
        } catch (e) {
          console.error('Error parsing local storage products:', e);
        }
      }
    }

    if (!rawProducts || rawProducts.length === 0) {
      rawProducts = DEFAULT_PRODUCTS;
    }
    if (!rawCategories || rawCategories.length === 0) {
      rawCategories = DEFAULT_CATEGORIES;
    }

    // Filter active products only
    const activeProducts = rawProducts.filter(p => p.active !== false);

    // Build category lookup map
    const catMap: Record<string, Category> = {};
    rawCategories.forEach(c => {
      catMap[c.id] = c;
    });

    // Sanitize to PublicProduct (STRICT PROJECTION OF SAFE FIELDS)
    return activeProducts.map(p => sanitizeToPublicProduct(p, catMap));
  } catch (err) {
    console.error('Error fetching public products:', err);
    const catMap: Record<string, Category> = {};
    DEFAULT_CATEGORIES.forEach(c => { catMap[c.id] = c; });
    return DEFAULT_PRODUCTS.map(p => sanitizeToPublicProduct(p, catMap));
  }
}

export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  try {
    let rawCategories: Category[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('categories').select('*').order('name');
      rawCategories = (data || []) as Category[];
    } else {
      if (typeof window !== 'undefined') {
        try {
          const savedCategories = localStorage.getItem('pink_pulse_categories');
          if (savedCategories) rawCategories = JSON.parse(savedCategories);
        } catch (e) {}
      }
    }

    if (!rawCategories || rawCategories.length === 0) {
      rawCategories = DEFAULT_CATEGORIES;
    }

    // Category emoji/icon mapping for modern cards
    const categoryIcons: Record<string, string> = {
      'excitantes': '❤️',
      'lubrificantes': '💦',
      'lingeries': '🎀',
      'plugs': '🍑',
      'plugs-acessorios': '🍑',
      'aneis': '💍',
      'aneis-estimuladores': '💍',
      'jogos': '🎲',
      'jogos-kits': '🎲',
      'kits': '🎁',
      'cosmeticos': '🧴',
      'cosmeticos-oleos': '🧴',
    };

    return rawCategories.map(c => {
      const slug = slugify(c.name);
      const matchedKey = Object.keys(categoryIcons).find(k => slug.includes(k)) || '';
      const icon = categoryIcons[matchedKey] || '✨';

      return {
        id: c.id,
        name: c.name,
        slug,
        description: c.description || `Produtos selecionados da categoria ${c.name}`,
        icon
      };
    });
  } catch (err) {
    return DEFAULT_CATEGORIES.map(c => ({
      id: c.id,
      name: c.name,
      slug: slugify(c.name),
      description: c.description,
      icon: '✨'
    }));
  }
}

export function generateWhatsAppPurchaseUrl(
  productName: string, 
  price: number, 
  phone: string = '24999092402',
  template?: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPrice = price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  let msg = template || DEFAULT_PUBLIC_SETTINGS.whatsappMessageTemplate;
  msg = msg.replace('{nome}', productName).replace('{preco}', formattedPrice);

  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
