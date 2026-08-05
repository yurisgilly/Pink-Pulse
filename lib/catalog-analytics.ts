import { CatalogReview, ReviewStatus, CatalogViewStats } from '@/types/public-catalog.types';
import { isSupabaseConfigured, supabase } from './supabase';

const VIEWS_KEY = 'pink_pulse_catalog_views';
const REVIEWS_KEY = 'pink_pulse_catalog_reviews';

// Sample initial reviews if local storage is empty
const DEFAULT_REVIEWS: CatalogReview[] = [
  {
    id: 'rev-1',
    name: 'Fernanda M.',
    rating: 5,
    comment: 'Atendimento incrível e embalagem 100% discreta! Os produtos chegaram super rápido e bem embalados.',
    status: 'approved',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    name: 'Juliana Santos',
    rating: 5,
    comment: 'Produtos de altíssima qualidade! A entrega foi super rápida e o atendimento via WhatsApp é fantástico.',
    status: 'approved',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-3',
    name: 'Camila R.',
    rating: 4,
    comment: 'Amei o sabonete íntimo e o óleo corporal velvet. Embalagem sofisticada e cheirinho maravilhoso!',
    status: 'approved',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-4',
    name: 'Anônimo VIP',
    rating: 5,
    comment: 'Excelente loja! Super discreto na fatura do cartão e a entrega via motoboy foi impecável.',
    status: 'approved',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-5',
    name: 'Beatriz C.',
    rating: 5,
    comment: 'Adorei os lançamentos do catálogo público! Gostaria de saber quando chega a nova coleção de lingeries.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to get local views
function getLocalViews(): { id: string; timestamp: string; date_str: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(VIEWS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading catalog views from local storage:', e);
  }
  
  // Initialize sample history views for demo mode if empty
  const sampleViews: { id: string; timestamp: string; date_str: string }[] = [];
  const now = new Date();
  
  // Seed sample views across past 14 days
  const dailyDistribution = [47, 52, 38, 41, 60, 44, 44, 39, 50, 48, 55, 62, 70, 47];
  dailyDistribution.forEach((count, daysAgoIndex) => {
    const targetDate = new Date(now.getTime() - daysAgoIndex * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    for (let i = 0; i < count; i++) {
      sampleViews.push({
        id: `view-${daysAgoIndex}-${i}`,
        timestamp: targetDate.toISOString(),
        date_str: dateStr
      });
    }
  });

  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(sampleViews));
  } catch (e) {}

  return sampleViews;
}

// Helper to save local views
function saveLocalViews(views: { id: string; timestamp: string; date_str: string }[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch (e) {
    console.error('Error saving catalog views to local storage:', e);
  }
}

// Helper to get local reviews
function getLocalReviews(): CatalogReview[] {
  if (typeof window === 'undefined') return DEFAULT_REVIEWS;
  try {
    const saved = localStorage.getItem(REVIEWS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading catalog reviews from local storage:', e);
  }
  // Initialize default sample reviews
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(DEFAULT_REVIEWS));
  } catch (e) {}
  return DEFAULT_REVIEWS;
}

// Helper to save local reviews
function saveLocalReviews(reviews: CatalogReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving catalog reviews to local storage:', e);
  }
}

// ==========================================
// 1. CATALOG VIEW COUNTER FUNCTIONS
// ==========================================

/**
 * Records a catalog view access. Uses session storage to prevent continuous
 * page refreshes in the same session from inflating view counts.
 */
export async function recordCatalogView(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Session deduplication check (30 min window or session duration)
  const sessionRecordedKey = 'pink_pulse_catalog_view_session';
  const lastRecorded = sessionStorage.getItem(sessionRecordedKey);
  const now = Date.now();

  if (lastRecorded) {
    const elapsed = now - parseInt(lastRecorded, 10);
    // If recorded less than 15 minutes ago in this session, skip increment
    if (elapsed < 15 * 60 * 1000) {
      return;
    }
  }

  sessionStorage.setItem(sessionRecordedKey, now.toString());

  const todayStr = new Date().toISOString().split('T')[0];
  const newViewObj = {
    id: `view-${now}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    date_str: todayStr
  };

  // Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('catalog_views').insert([{
        date_str: todayStr
      }]);
      if (error) {
        console.warn('[Catalog Analytics] Supabase error recording view, saving locally:', error.message);
        const views = getLocalViews();
        views.push(newViewObj);
        saveLocalViews(views);
      }
      return;
    } catch (err) {
      console.warn('[Catalog Analytics] Exception recording view on Supabase:', err);
    }
  }

  // Local Storage Fallback
  const views = getLocalViews();
  views.push(newViewObj);
  saveLocalViews(views);
}

/**
 * Gets view counter metrics exclusively for the Admin Panel.
 */
export async function getCatalogViewStats(): Promise<CatalogViewStats> {
  let allViews: { timestamp: string; date_str: string }[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('catalog_views')
        .select('created_at, date_str');
      
      if (!error && data && data.length > 0) {
        allViews = data.map((item: any) => ({
          timestamp: item.created_at || new Date().toISOString(),
          date_str: item.date_str || (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
        }));
      } else {
        allViews = getLocalViews();
      }
    } catch (err) {
      console.warn('[Catalog Analytics] Fallback to local views:', err);
      allViews = getLocalViews();
    }
  } else {
    allViews = getLocalViews();
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let todayCount = 0;
  let last7DaysCount = 0;
  let thisMonthCount = 0;
  const totalCount = allViews.length;

  // Daily map for trend chart (last 14 days)
  const dailyTrendMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split('T')[0];
    dailyTrendMap[dateKey] = 0;
  }

  allViews.forEach(v => {
    const vDate = new Date(v.timestamp || v.date_str);
    const dateStr = v.date_str || vDate.toISOString().split('T')[0];

    // Today
    if (dateStr === todayStr) {
      todayCount++;
    }

    // Last 7 days
    if (vDate >= sevenDaysAgo) {
      last7DaysCount++;
    }

    // This month
    if (vDate.getFullYear() === currentYear && vDate.getMonth() === currentMonth) {
      thisMonthCount++;
    }

    // Daily chart aggregation
    if (dailyTrendMap[dateStr] !== undefined) {
      dailyTrendMap[dateStr]++;
    }
  });

  const dailyTrend = Object.entries(dailyTrendMap).map(([date, views]) => {
    const [year, month, day] = date.split('-');
    return {
      date,
      formattedDate: `${day}/${month}`,
      views
    };
  });

  return {
    today: todayCount,
    last7Days: last7DaysCount,
    thisMonth: thisMonthCount,
    total: totalCount,
    dailyTrend
  };
}

// ==========================================
// 2. CATALOG REVIEWS & MODERATION FUNCTIONS
// ==========================================

/**
 * Fetches approved reviews for public catalog display.
 */
export async function getApprovedCatalogReviews(): Promise<{
  reviews: CatalogReview[];
  averageRating: number;
  totalCount: number;
}> {
  let reviews: CatalogReview[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('catalog_reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data) {
        reviews = data as CatalogReview[];
      } else {
        reviews = getLocalReviews().filter(r => r.status === 'approved');
      }
    } catch (err) {
      reviews = getLocalReviews().filter(r => r.status === 'approved');
    }
  } else {
    reviews = getLocalReviews().filter(r => r.status === 'approved');
  }

  const totalCount = reviews.length;
  const sumRating = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const averageRating = totalCount > 0 ? parseFloat((sumRating / totalCount).toFixed(1)) : 5.0;

  return {
    reviews,
    averageRating,
    totalCount
  };
}

/**
 * Fetches ALL reviews for Admin Panel moderation (pending, approved, hidden).
 */
export async function getAllCatalogReviews(): Promise<CatalogReview[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('catalog_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as CatalogReview[];
      }
    } catch (err) {
      console.warn('[Catalog Analytics] Exception fetching reviews from Supabase:', err);
    }
  }
  return getLocalReviews().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Submits a new review from the public catalog. Default status is always 'pending'.
 */
export async function submitCatalogReview(input: {
  name: string;
  rating: number;
  comment: string;
}): Promise<CatalogReview> {
  const newReview: CatalogReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: input.name.trim() || 'Cliente VIP',
    rating: Math.min(5, Math.max(1, input.rating)),
    comment: input.comment.trim(),
    status: 'pending', // MANDATORY DEFAULT SECURITY RULE
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('catalog_reviews')
        .insert([{
          name: newReview.name,
          rating: newReview.rating,
          comment: newReview.comment,
          status: 'pending'
        }])
        .select()
        .single();

      if (!error && data) {
        return data as CatalogReview;
      } else {
        console.warn('[Catalog Analytics] Error submitting review to Supabase, saving locally:', error?.message);
      }
    } catch (err) {
      console.warn('[Catalog Analytics] Exception submitting review:', err);
    }
  }

  // Local Storage Fallback
  const reviews = getLocalReviews();
  reviews.unshift(newReview);
  saveLocalReviews(reviews);
  return newReview;
}

/**
 * Updates review status (approve, hide, set pending). Admin operation.
 */
export async function updateCatalogReviewStatus(
  id: string, 
  status: ReviewStatus
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('catalog_reviews')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.warn('[Catalog Analytics] Supabase review status update error:', error.message);
      }
    } catch (err) {
      console.warn('[Catalog Analytics] Exception updating review status:', err);
    }
  }

  // Always update local storage as well for fallback consistency
  const reviews = getLocalReviews();
  const idx = reviews.findIndex(r => r.id === id);
  if (idx !== -1) {
    reviews[idx].status = status;
    saveLocalReviews(reviews);
    return true;
  }
  return false;
}

/**
 * Deletes a review permanently. Admin operation.
 */
export async function deleteCatalogReview(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('catalog_reviews')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('[Catalog Analytics] Supabase review delete error:', error.message);
      }
    } catch (err) {
      console.warn('[Catalog Analytics] Exception deleting review:', err);
    }
  }

  const reviews = getLocalReviews();
  const updated = reviews.filter(r => r.id !== id);
  saveLocalReviews(updated);
  return true;
}
