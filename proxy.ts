import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Next.js Middleware — runs on every matched route before the handler.
 * Protects dashboard, upload pages, and API routes.
 * JWT is read from HTTP-only cookie "token".
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ["/dashboard", "/upload"];
  const protectedApiRoutes = ["/api/upload", "/api/file"];

  const isProtectedPage = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApi = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  // Extract JWT from HTTP-only cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // Redirect pages to login; return 401 for API routes
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify token to ensure it hasn't expired or been tampered with
    const payload = verifyToken(token);

    // Pass user info to the route handler via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token invalid or expired
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  // Apply middleware to these paths
  matcher: ["/dashboard/:path*", "/upload/:path*", "/api/upload/:path*", "/api/file/:path*"],
};
