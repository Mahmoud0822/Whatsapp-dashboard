"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { initializeSocket, disconnectSocket } from "@/lib/socket";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inicializa o socket quando o componente é montado
  useEffect(() => {
    if (status === "authenticated") {
      initializeSocket();
    }

    // Limpa o socket quando o componente é desmontado
    return () => {
      disconnectSocket();
    };
  }, [status]);

  // Redireciona para a página de login se não estiver autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Renderiza um estado de carregamento enquanto verifica a autenticação
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold">WhatsApp Business</h1>
        </div>
        <nav className="flex flex-col p-4">
          <Link
            href="/dashboard"
            className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
          >
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/chats"
            className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
          >
            <span>Conversas</span>
          </Link>
          <Link
            href="/dashboard/qrcode"
            className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
          >
            <span>Conectar WhatsApp</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
          >
            <span>Configurações</span>
          </Link>
        </nav>
        <div className="mt-auto border-t p-4">
          <div className="mb-4 flex items-center">
            <div className="ml-2">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header para mobile */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
          <h1 className="text-xl font-bold">WhatsApp Business</h1>
          <button
            onClick={toggleMobileMenu}
            className="rounded-md p-2 hover:bg-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </header>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-background md:hidden">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <h1 className="text-xl font-bold">WhatsApp Business</h1>
              <button
                onClick={toggleMobileMenu}
                className="rounded-md p-2 hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col p-4">
              <Link
                href="/dashboard"
                className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/chats"
                className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                <span>Conversas</span>
              </Link>
              <Link
                href="/dashboard/qrcode"
                className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                <span>Conectar WhatsApp</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className="mb-2 flex items-center rounded-md px-4 py-2 hover:bg-accent"
                onClick={toggleMobileMenu}
              >
                <span>Configurações</span>
              </Link>
            </nav>
            <div className="border-t p-4">
              <div className="mb-4 flex items-center">
                <div className="ml-2">
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}