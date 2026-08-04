import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/catalogo',
  '/busca',
  '/login',
];

const PROTECTED_ROUTES = [
  '/dashboard',
  '/vendas',
  '/estoque',
  '/financeiro',
  '/fiados',
  '/clientes',
  '/fornecedores',
  '/comprovantes',
  '/promocoes',
  '/relatorios',
  '/alertas',
  '/usuarios',
  '/catalogo-admin',
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isSupabaseConfigured = !!(
    supabaseUrl &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key'
  );

  const pathname = request.nextUrl.pathname;

  // Se o Supabase não estiver configurado, permite a navegação sem travar o app
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Atualiza / valida a sessão do usuário com segurança no servidor
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verifica se é uma rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Se não estiver autenticado e tentar acessar uma rota administrativa protegida
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se estiver autenticado e tentar acessar a tela de login, redireciona para o dashboard
  if (user && pathname === '/login') {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetUrl = request.nextUrl.clone();
    if (
      redirectParam &&
      PROTECTED_ROUTES.some((route) => redirectParam.startsWith(route))
    ) {
      targetUrl.pathname = redirectParam;
    } else {
      targetUrl.pathname = '/dashboard';
    }
    targetUrl.searchParams.delete('redirect');
    return NextResponse.redirect(targetUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto arquivos estáticos, imagens e rotas da API do Next
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
