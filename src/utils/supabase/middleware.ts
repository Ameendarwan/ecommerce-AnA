import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isMockMode } from '@/lib/mockMode';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (isMockMode()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isMockMode()) {
    return response;
  }

  // Protect routes that require authentication (cart/checkout are guest-friendly)
  const protectedPaths = ['/profile', '/admin', '/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    // Store the original URL to redirect back after login
    const returnTo = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/signin?returnTo=${returnTo}`, request.url)
    );
  }

  return response;
}
