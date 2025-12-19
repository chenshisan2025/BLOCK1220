import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_KEY = process.env.ADMIN_KEY || "";

function unauthorizedJson() {
  return NextResponse.json({ code: "UNAUTHORIZED", message: "Admin key required" }, { status: 401 });
}

function unauthorizedPage() {
  return new NextResponse(
    `<html><body style="font-family:ui-sans-serif;padding:24px"><h2>401 Unauthorized</h2><p>Admin key required.</p><p>Provide <code>x-admin-key</code> header or <code>admin_key</code> cookie.</p></body></html>`,
    { status: 401, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (!ADMIN_KEY) {
    if (process.env.NODE_ENV === "production") {
      return isAdminApi ? unauthorizedJson() : unauthorizedPage();
    }
    return NextResponse.next();
  }
  const headerKey = req.headers.get("x-admin-key") || "";
  const cookieKey = req.cookies.get("admin_key")?.value || "";
  if (headerKey === ADMIN_KEY || cookieKey === ADMIN_KEY) {
    return NextResponse.next();
  }
  return isAdminApi ? unauthorizedJson() : unauthorizedPage();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
