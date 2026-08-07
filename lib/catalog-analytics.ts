import { CatalogReview, ReviewStatus, CatalogViewStats } from '@/types/public-catalog.types';
import { isSupabaseConfigured, supabase } from './supabase';

// ==========================================
// 1. CATALOG VIEW COUNTER FUNCTIONS
// ==========================================

/**
 * Records a real catalog view access directly in Supabase catalog_views table.
 * NO session locking or local storage fallback.
 */
export async function recordCatalogView(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!isSupabaseConfigured || !supabase) {
    console.warn('[Catalog Analytics] Supabase is not configured. Unable to record catalog view.');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const { error } = await supabase.from('catalog_views').insert([{
      date_str: todayStr
    }]);

    if (error) {
      console.error('[Catalog Analytics] Error recording catalog view to Supabase:', error.message);
    }
  } catch (err: any) {
    console.error('[Catalog Analytics] Exception recording catalog view to Supabase:', err);
  }
}

/**
 * Gets real view counter metrics exclusively from Supabase catalog_views for the Admin Panel.
 * If Supabase returns 0 records or fails, zero metrics are returned without mock data.
 */
export async function getCatalogViewStats(): Promise<CatalogViewStats> {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Prepare default empty 14-day daily trend map
  const dailyTrendMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split('T')[0];
    dailyTrendMap[dateKey] = 0;
  }

  let allViews: { timestamp: string; date_str: string }[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      const thirtyDaysAgoStr = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('catalog_views')
        .select('created_at, date_str')
        .gte('date_str', thirtyDaysAgoStr);
      
      if (error) {
        console.error('[Catalog Analytics] Error fetching catalog_views from Supabase:', error.message);
      } else if (data) {
        allViews = data.map((item: any) => ({
          timestamp: item.created_at || new Date().toISOString(),
          date_str: item.date_str || (item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
        }));
      }
    } catch (err: any) {
      console.error('[Catalog Analytics] Exception fetching catalog_views from Supabase:', err);
    }
  }

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let todayCount = 0;
  let last7DaysCount = 0;
  let thisMonthCount = 0;
  const totalCount = allViews.length;

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
    const [, month, day] = date.split('-');
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
 * Fetches approved reviews from Supabase catalog_reviews for public display.
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
        .select('id, name, rating, comment, status, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Catalog Analytics] Error fetching approved reviews from Supabase:', error.message);
      } else if (data) {
        reviews = data as CatalogReview[];
      }
    } catch (err: any) {
      console.error('[Catalog Analytics] Exception fetching approved reviews from Supabase:', err);
    }
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
 * Fetches ALL reviews directly from Supabase catalog_reviews for Admin Panel moderation.
 */
export async function getAllCatalogReviews(): Promise<CatalogReview[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('catalog_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Catalog Analytics] Error fetching all catalog_reviews from Supabase:', error.message);
        return [];
      }
      if (data) {
        return data as CatalogReview[];
      }
    } catch (err: any) {
      console.error('[Catalog Analytics] Exception fetching catalog_reviews from Supabase:', err);
      return [];
    }
  }
  return [];
}

/**
 * Submits a new review to Supabase catalog_reviews. Default status is MANDATORY 'pending'.
 */
export async function submitCatalogReview(input: {
  name: string;
  rating: number;
  comment: string;
}): Promise<CatalogReview> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('O Supabase não está configurado. Não é possível enviar avaliações no momento.');
  }

  const name = input.name.trim() || 'Cliente VIP';
  const rating = Math.min(5, Math.max(1, input.rating));
  const comment = input.comment.trim();

  const reviewObject: CatalogReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    rating,
    comment,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    // Pure INSERT without .select() because public users only have SELECT permission on 'approved' reviews.
    // Chaining .select() on a 'pending' review triggers an RLS violation on the returning SELECT check.
    const { error } = await supabase
      .from('catalog_reviews')
      .insert([{
        name,
        rating,
        comment,
        status: 'pending' // MANDATORY DEFAULT SECURITY RULE
      }]);

    if (error) {
      console.error('[Catalog Analytics] Error submitting review to Supabase:', error.message);
      throw new Error(error.message);
    }

    return reviewObject;
  } catch (err: any) {
    console.error('[Catalog Analytics] Exception submitting review to Supabase:', err);
    throw err;
  }
}

/**
 * Updates review status (approved, hidden, pending) directly in Supabase catalog_reviews.
 */
export async function updateCatalogReviewStatus(
  id: string, 
  status: ReviewStatus
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('O Supabase não está configurado. Não é possível alterar o status da avaliação.');
  }

  try {
    const { error } = await supabase
      .from('catalog_reviews')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[Catalog Analytics] Supabase review status update error:', error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (err: any) {
    console.error('[Catalog Analytics] Exception updating review status in Supabase:', err);
    throw err;
  }
}

/**
 * Permanently deletes a review directly from Supabase catalog_reviews.
 */
export async function deleteCatalogReview(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('O Supabase não está configurado. Não é possível excluir a avaliação.');
  }

  try {
    const { error } = await supabase
      .from('catalog_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Catalog Analytics] Supabase review delete error:', error.message);
      throw new Error(error.message);
    }

    return true;
  } catch (err: any) {
    console.error('[Catalog Analytics] Exception deleting review from Supabase:', err);
    throw err;
  }
}
