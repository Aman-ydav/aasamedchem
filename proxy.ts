import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROLE_HOME = {
  ADMIN: "/admin",
  SELLER: "/seller",
  BUYER: "/buyer",
} as const;

const GUARDS: Array<{ prefix: string; role: keyof typeof ROLE_HOME }> = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/seller", role: "SELLER" },
  { prefix: "/buyer", role: "BUYER" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guard = GUARDS.find(
    (g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"),
  );
  if (!guard) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token.role !== guard.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[token.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*"],
};
