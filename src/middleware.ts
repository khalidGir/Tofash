import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith('/customer') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin');

  if (isProtectedRoute) {
    // Dev mode: check for dev_role cookie
    const devRole = request.cookies.get('dev_role')?.value;
    if (devRole) {
      if (pathname.startsWith('/admin') && devRole !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/seller') && devRole !== 'seller') {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (pathname.startsWith('/customer') && devRole && devRole !== 'customer') {
        if (devRole === 'seller') return NextResponse.redirect(new URL('/seller/dashboard', request.url));
        if (devRole === 'admin') return NextResponse.redirect(new URL('/admin/sellers', request.url));
      }
      return response;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = profile?.role;

    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/seller') && role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/customer') && role && role !== 'customer') {
      if (role === 'seller') return NextResponse.redirect(new URL('/seller/dashboard', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/sellers', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
