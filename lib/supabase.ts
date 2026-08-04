import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Inicialização segura que evita falhas de build/inicialização se as chaves não estiverem configuradas
export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key');

export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const isUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export const getValidUserId = async (providedUserId?: string | null): Promise<string | null> => {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    // 1. Tentar providedUserId se for UUID válido
    if (providedUserId && isUuid(providedUserId)) {
      const { data } = await supabase.from('users').select('id').eq('id', providedUserId).maybeSingle();
      if (data?.id) {
        return data.id;
      }
    }

    // 2. Tentar usuário autenticado do Supabase Auth
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;

    if (authUser && isUuid(authUser.id)) {
      // Verificar por ID na tabela public.users
      const { data: userById } = await supabase.from('users').select('id').eq('id', authUser.id).maybeSingle();
      if (userById?.id) {
        return userById.id;
      }

      // Verificar por email na tabela public.users
      if (authUser.email) {
        const { data: userByEmail } = await supabase.from('users').select('id').eq('email', authUser.email).maybeSingle();
        if (userByEmail?.id) {
          return userByEmail.id;
        }
      }

      // Tentar cadastrar o usuário autenticado na tabela public.users para satisfazer a FK
      const { data: newUser } = await supabase.from('users').insert([{
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
        email: authUser.email || `${authUser.id}@auth.local`,
        role: 'VENDEDOR',
        active: true
      }]).select('id').maybeSingle();

      if (newUser?.id) {
        return newUser.id;
      }
    }
  } catch (err) {
    console.error('Erro ao determinar user_id para Supabase:', err);
  }

  // Fallback seguro: se não houver usuário autenticado no banco, grava null
  return null;
};

console.log(
  isSupabaseConfigured 
    ? '[Pink Pulse] Conectado com sucesso ao Supabase.' 
    : '[Pink Pulse] Rodando em Modo de Demonstração (Local Fallback). Chaves do Supabase pendentes.'
);
