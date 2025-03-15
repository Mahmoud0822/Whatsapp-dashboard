import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

// Rotas de API que não precisam de autenticação
const publicApiRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se é uma rota pública
  if (publicRoutes.some(route => pathname === route) || 
      publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Verifica se é uma rota de recursos estáticos
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") // Arquivos com extensão (imagens, css, js, etc)
  ) {
    return NextResponse.next();
  }

  // Verifica se o usuário está autenticado
  const token = await getToken({ req: request });
  
  // Se não estiver autenticado, redireciona para a página de login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};