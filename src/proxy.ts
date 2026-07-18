import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_GATE_COOKIE, expectedGateValue } from "@/lib/siteGate";

// Next.js 16renames Middleware to Proxy (same underlying mechanism/API).
// This refreshes the Supabase session cookie on every request, optionally
// gates the entire site behind a shared testing password, and gates /admin
// routes behind real Supabase authentication.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 認証コールバックはメールアプリ内ブラウザなど別のCookie文脈で開かれることが
  // あるため、ゲートを挟まず必ず通す(ゲート自体は/adminなどで別途かかる)。
  if (!pathname.startsWith("/gate") && !pathname.startsWith("/auth/callback")) {
    const expected = await expectedGateValue();
    if (expected) {
      const cookieValue = request.cookies.get(SITE_GATE_COOKIE)?.value;
      if (cookieValue !== expected) {
        const gateUrl = new URL("/gate", request.url);
        gateUrl.searchParams.set("next", pathname + request.nextUrl.search);
        return NextResponse.redirect(gateUrl);
      }
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
