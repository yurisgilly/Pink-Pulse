export interface PublicProduct {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  sell_price: number;
  image_url?: string;
  images?: string[];
  in_stock: boolean;
  brand?: string;
  badge?: 'Novo' | 'Promoção' | 'Mais vendido' | 'Lançamento' | 'Últimas unidades' | null;
  tags?: string[];
  slug: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  product_count?: number;
}

export interface PublicCatalogSettings {
  enabled: boolean;
  storeName: string;
  tagline: string;
  description: string;
  whatsappNumber: string; // e.g. "24999092402"
  whatsappMessageTemplate: string;
  instagramUrl: string;
  emailContact: string;
  banner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
    bgColor?: string;
  };
  featuredCategoryIds: string[];
  featuredProductIds: string[];
}
